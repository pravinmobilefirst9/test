import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { SbWidgetContext } from 'src/model/sb-widget-context';
import { SbEventListener, QueryParamConfig } from 'src/model/sb-event-listener';
import { SbEventBusService } from 'src/services/sb-event-bus.service';
import { SbHost } from 'src/model/sb-host-enum';
import { HttpParams } from '@angular/common/http';
import { SbEvent } from 'src/services/sb-event';
import * as dot from 'dot-prop';
import { SbDataService } from 'src/services/sb-data.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ReplaySubject, Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { filter, skip } from 'rxjs/operators';

@Component({
  selector: 'app-base-widget',
  templateUrl: './base-widget.component.html',
  styleUrls: ['./base-widget.component.scss']
})
export class BaseWidgetComponent implements OnInit, OnDestroy {
  @Input() context: SbWidgetContext;
  @Output() headerInfo = new EventEmitter<string>();
  protected autoTriggerDataLoad = false;
  protected subscriptions: Subscription[] = [];
  private optionalRouteParams: ParamMap;
  private prevParams;
  public isLoading: boolean = false;
  public responseHandler: (response: any) => void;
  public responseErrorHandler: (error: any) => void = this.defaultErrorHandler;
  constructor(
    protected dataService: SbDataService,
    protected eventBus: SbEventBusService,
    protected activatedRoute: ActivatedRoute,
    protected spinner: NgxSpinnerService
  ) {
    this.activatedRoute.queryParamMap.subscribe(queryParamMap => {
      this.optionalRouteParams = queryParamMap;
    });
    this.prevParams = this.activatedRoute.snapshot.queryParams;
  }

  predicate = newParams => {
    const previousEmpty = Object.keys(this.prevParams).length === 0;
    return !previousEmpty && JSON.stringify(newParams) !== JSON.stringify(this.prevParams);
  }

  ngOnInit() {
    if (this.context.filterListeners) {
      this.context.filterListeners.forEach(filterListener => this.registerListenerFromContext(filterListener));
      if (this.autoTriggerDataLoad) {
        this.loadInitialData();
      }
      this.activatedRoute.queryParams.pipe(filter(this.predicate)).subscribe(params => {
        this.prevParams = params;
        let httpParams = new HttpParams();
        for (const [key, value] of Object.entries(params)) {
          httpParams = httpParams.append(key, value as string);
        }
        this.loadDataWithParams(this.getQueryParamsFromRoute(httpParams));
      });
    } else {
      this.loadInitialData();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => {
      if (s) {
        s.unsubscribe();
      }
    });
  }

  registerListenerFromContext(filterListener: SbEventListener) {
    const sub = this.eventBus.getObservable(filterListener.topic).subscribe(
      event => {
        this.handleApplicableFilterEvent(event, filterListener);
      },
      error => console.log(error)
    );
    this.subscriptions.push(sub);
  }

  handleApplicableFilterEvent(
    event: SbEvent,
    filterListener: SbEventListener
  ): any {
    if (event &&
      event.topic === filterListener.topic &&
      event.source === filterListener.source
    ) {
      this.handleFilterEvent(event);
    }
  }

  // Override this to get access to filter event properties. Call super if you still want data to be loaded from server from here.
  handleFilterEvent(event: SbEvent) {
    const result = this.eventBus.getAggregatedResult(this.context.filterListeners);
    let httpParams: HttpParams = new HttpParams();
    result.forEach(tuple => {
      const filterListener: SbEventListener = tuple.eventListener;
      const payload = tuple.payload;
      if (filterListener.queryParameters && payload) {
        httpParams = this.mapFilterPayloadToQueryParameters(payload.payload, filterListener.queryParameters, httpParams);
      }
    });

    if (this.context.queryParamsFromRoute) {
      // Merge from route if exists
      httpParams = this.getQueryParamsFromRoute(httpParams);
    }
    this.loadDataWithParams(httpParams);
  }

  private allMandatoryHttpParamsIncluded(
    httpParams: HttpParams,
    queryParams: QueryParamConfig[]
  ): boolean {
    if (queryParams) {
      return queryParams
        .filter(qp => qp.mandatory)
        .every(qp => httpParams.has(qp.queryParamName));
    } else {
      return true;
    }
  }

  loadDataWithParams(httpParams: HttpParams) {
    if (
      !this.context.filterListeners ||
      this.allMandatoryHttpParamsIncluded(
        httpParams,
        this.context.filterListeners.map(filterListener => filterListener.queryParameters).reduce((p1, p2) => p1.concat(p2))
      )
    ) {
      this.spinner.show(this.context.widgetId);
      this.isLoading = true;

      // Invoke new load-data call with configurable parameters
      this.dataService
        .getDataWithParams(
          this.context.path,
          httpParams,
          SbHost.WidgetDataBaseUrl
        )
        .subscribe(
          responseData => {
            this.spinner.hide(this.context.widgetId);
            this.isLoading = false;
            this.responseHandler(responseData);
            this.emitStandardHeaderInfoText(httpParams);
          },
          error => {
            this.spinner.hide(this.context.widgetId);
            this.isLoading = false;
            this.responseErrorHandler(error);
          }
        );
    }
  }

  private emitStandardHeaderInfoText(httpParams: HttpParams) {
    this.headerInfo.emit(this.getHeaderText(httpParams));
  }

  // Override this if we need to add some other properties in header info text.
  protected getHeaderText(httpParams: HttpParams): string {
    if (httpParams.has('toDate')) {
      let headerText = '';
      // Assuming toDate always exists if fromDate exists.
      if (httpParams.has('fromDate')) {
        const fromDate = new Date(httpParams.get('fromDate'));
        headerText += fromDate.toLocaleDateString() + ' - ';
      }
      const toDate = new Date(httpParams.get('toDate'));
      headerText += toDate.toLocaleDateString();
      return headerText;
    }
    return '';
  }

  mapFilterPayloadToQueryParameters(
    payload: any,
    queryParameters: QueryParamConfig[],
    optionalHttpParams?: HttpParams
  ): HttpParams {
    let httpParams: HttpParams = optionalHttpParams || new HttpParams();
    queryParameters.reduce((accumulator, paramConfig) => {
      const paramName = paramConfig.queryParamName;
      const value: any = dot.get(payload, paramConfig.sourcePath);

      if (Array.isArray(value)) {
        httpParams = value.reduce((valueAccumulator, item) => {
          return valueAccumulator.append(
            paramName,
            this.getFormattedHttpParameter(item)
          );
        }, httpParams);
      } else if (value) {
        httpParams = httpParams.append(
          paramName,
          this.getFormattedHttpParameter(value)
        );
      }
      return accumulator;
    }, httpParams);
    return httpParams;
  }
  private getFormattedHttpParameter(value) {
    return value instanceof Date ? value.toJSON() : value;
  }

  loadInitialData() {
    let httpParams = new HttpParams();
    if (this.context.queryParamsFromRoute) {
      httpParams = this.getQueryParamsFromRoute(httpParams);
      this.context.queryParamsFromRoute.forEach(qp => {
        const routeValue = this.optionalRouteParams.get(qp.sourcePath);
        if (routeValue) {
          const param = qp.queryParamName;
          const value = this.optionalRouteParams.get(qp.sourcePath);
          // Do not add the same value again
          if (!(httpParams.has(param) && httpParams.get(param) === value)) {
            httpParams = httpParams.append(param, value);
          }
        }
      });
    }
    this.loadDataWithParams(httpParams);
  }

  getQueryParamsFromRoute(httpParams: HttpParams): HttpParams {
    this.context.queryParamsFromRoute.forEach(qp => {
      const routeValue = this.optionalRouteParams.get(qp.sourcePath);
      if (routeValue && !httpParams.has(qp.queryParamName)) {
        httpParams = httpParams.append(
          qp.queryParamName,
          this.optionalRouteParams.get(qp.sourcePath)
        );
      }
    });
    return httpParams;
  }

  defaultErrorHandler(error: any) {
    console.error(`Failed to fetch data: ${JSON.stringify(error)}`);
  }
}
