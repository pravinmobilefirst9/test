import { first } from 'rxjs/operators';
import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { SbKeyFigureAdvancedContext } from 'src/model/sb-key-figure-advanced-context';
import { SbDataService } from 'src/services/sb-data.service';
import { FormattingFunctions } from '../sb-ag-table/formatting-functions';
import { DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { SbEventBusService } from 'src/services/sb-event-bus.service';
import { getObject } from '../../utils';
import { Subscription } from 'rxjs';
import { BaseWidgetComponent } from '../base-widget/base-widget.component';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { SbPropertiesService } from 'src/services/sb-properties.service';
import * as dot from 'dot-prop';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from 'src/environments/environment';
class KeyFigureValue {
  value: string;
  valueClass?: string[];
  valueInlineStyle?: any;
  field?: string;
  // Optional label used for table layout
  label?: string;
}
interface KeyFigureElement {
  key: string;
  labelClass?: string[];
  labelInlineStyle?: any;
  values: KeyFigureValue[];
}

@Component({
  selector: 'app-sb-key-figure-advanced',
  templateUrl: './sb-key-figure-advanced.component.html',
  styleUrls: ['./sb-key-figure-advanced.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SbKeyFigureAdvancedComponent extends BaseWidgetComponent
  implements OnInit, OnDestroy {
  @Input() context: SbKeyFigureAdvancedContext;
  
  public clientName: string =environment.client.clientName; // imported from environments.ts
  // Original dataset loaded remotely via URL configuration
  rawData: any;

  dataElements: KeyFigureElement[];
  subscription: Subscription;
  formattingFunctions: FormattingFunctions;

  constructor(
    dataService: SbDataService,
    eventBus: SbEventBusService,
    private changeDetectorRef: ChangeDetectorRef,
    dateFormatter: DatePipe,
    numberFormatter: DecimalPipe,
    percentFormatter: PercentPipe,
    activatedRoute: ActivatedRoute,
    private router: Router,
    private propertiesService: SbPropertiesService,
    protected spinner: NgxSpinnerService
  ) {
    super(dataService, eventBus, activatedRoute, spinner);
    this.responseHandler = this.setData;
    this.autoTriggerDataLoad = true;
    this.formattingFunctions = new FormattingFunctions(
      dateFormatter,
      numberFormatter,
      percentFormatter,
      propertiesService
    );
  }

  ngOnInit() {
    super.ngOnInit();
    if (this.context.filterListeners) {
      this.registerEventListeners();
    }
  }

  getBulletField(): string {
    return this.context.bulletField || 'key';
  }

  getBulletCssClasses(key?: any, element?: any, index?) {
    const cssClasses: String[] = [];
    if (this.context.bullets) {
      cssClasses.push('sb-circle');
    }

    if (this.context.bulletColors) {
      const bulletColorKey = key ? key : 'EMPTY';
      let colorFound = false;
      const color = this.context.bulletColors[bulletColorKey];
      if (color) {
        cssClasses.push(color);
        colorFound = true;
      }
      if (!colorFound) {
        const defaultColor = this.context.bulletColors['DEFAULT'];
        if (defaultColor) {
          cssClasses.push(defaultColor);
        }
      }
    }
    return cssClasses;
  }

  // Todo - move to base class and add local filter update flag in widgetcontext.
  registerEventListeners() {
    this.context.filterListeners.forEach(filterListener => {
      this.subscription = this.eventBus
        .getObservable(filterListener.topic)
        .subscribe(
          event => {
            if (event &&
              event.topic === filterListener.topic &&
              this.rawData
            ) {
              const filteredData = this.rawData.filter(element => {
                const value = getObject(
                  filterListener.targetField,
                  element
                );
                return event.payload.value.includes(value);
              });
              this.setDataElements(filteredData);
            }
          },
          error => {
            console.error(error);
          }
        );
      // Will be disposed in super.ngOnDestroy
      this.subscriptions.push(this.subscription);
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  verticalLayout(): boolean {
    return this.context.layout === 'vertical';
  }
  horisontalLayout(): boolean {
    return this.context.layout === 'horisontal';
  }
  tableLayout(): boolean {
    return this.context.layout === 'table';
  }

  getKeyFigureValue(key, value): KeyFigureValue {
    const columnFormatting = this.context.columnFormatting || {};
    const types = columnFormatting[key] || [];
    const cellClassRules = this.formattingFunctions.getCellClassRulesFromCellTypes(types, value);
    const formattedText = this.formattingFunctions.getFormattedTextFromCellTypes(this.context, types, value);

    return {
      value: formattedText,
      valueClass: this.getCssClass(
        cellClassRules,
        'value',
        this.context.valueClass
      ),
      valueInlineStyle: this.context.valueInlineStyle || {}
    };
  }

  getKeyFigureElement(key): KeyFigureElement {
    return {
      key: this.propertiesService.getProperty(key),
      values: [],
      labelClass: this.getCssClass([], 'label', this.context.labelClass),
      labelInlineStyle: this.context.labelInlineStyle || {}
    };
  }

  isObject(value): boolean {
    return typeof value === 'object' && value !== null;
  }

  getColumnConfiguration() {
    return this.context.columnConfiguration;
  }

  getDefaultAlignment(index): string {
    const alignment =
      this.context.columnAlignment && this.context.columnAlignment[index];
    return alignment;
  }

  abbreviate(text: String) {
    return text != null ? text.toUpperCase().substring(0, 2) : '';
  }

  public trackByFunction(index, item) {
    if (!item) {
      return index;
    }
    return index;
  }

  private setData(responseData: any) {
    this.rawData = responseData;
    this.setDataElements(responseData);
  }

  setDataElements(data) {
    const filteredData = data
      .filter(element => {
        return (
          this.context.columnFilter === undefined ||
          this.context.columnFilter.indexOf(element[this.getBulletField()]) > -1
        );
      });
    const sortedFilterData = this.context.columnFilter && this.context.columnFilter.length > 0 ?
      filteredData.sort(this.columnFilterComparator(this.context.columnFilter)) : filteredData;
    const elements = sortedFilterData
      .map(element => {
        const keyValue = element[this.getBulletField()];
        if (element.value) {
          return Object.assign({}, this.getKeyFigureElement(keyValue), {
            values: [this.getKeyFigureValue(keyValue, element.value)]
          });
        } else if (element.values) {
          const values = element.values.map(value => {
            return this.getKeyFigureValue(keyValue, value);
          });
          return Object.assign({}, this.getKeyFigureElement(keyValue), {
            values
          });
        } else if (element instanceof Object) {
          if (this.context.layout === 'table') {
            return this.getKeyValueElementsForTableLayout(element);
          } else {
            return this.getKeyValueElementFromBulletLayout(keyValue, element);
          }
        } else {
          console.error('Element value is missing');
          return [];
        }
      });
    this.dataElements = [...elements.reduce((acc, val) => acc.concat(val), [])];
    this.changeDetectorRef.markForCheck();
  }

  getKeyValueElementsForTableLayout(element: any): KeyFigureElement {
    const values = this.context.columnConfiguration.map(c => {
      const value = element.hasOwnProperty(c.field) ? element[c.field] : '';
      const kfv = this.getKeyFigureValue(c.field, value);
      return Object.assign({}, kfv, {
        field: c.field,
        label: c.label ? c.label : c.field
      });
    });
    return Object.assign({}, this.getKeyFigureElement('key'), {
      values: values
    });
  }

  // Generator function for comparing data elements (with 'key' with values in columnfilter)
  columnFilterComparator(columnFilter: string[]) {
    // Return comparator function
    // Assumes values match column filter and gets sorted by index order
    return function (a, b) {
      if (!a.hasOwnProperty('key') || !b.hasOwnProperty('key') || columnFilter === undefined) {
        return 0;
      }
      const cf = columnFilter;
      if (cf.indexOf(a.key) < cf.indexOf(b.key)) {
        return -1;
      }
      if (cf.indexOf(a.key) > cf.indexOf(b.key)) {
        return 1;
      }
      return 0;
    };
  }

  private getKeyValueElementFromBulletLayout(keyValue: any, element: any) {
    const keyFigureValue = this.getKeyFigureValue(keyValue, element.hasOwnProperty('value') ? element.value : element);
    return Object.assign({}, this.getKeyFigureElement(keyValue), {
      value: keyFigureValue,
      values: [keyFigureValue]
    });
  }

  getCssClass(
    cellClassRules: string[],
    suffix: string = 'label',
    contextCssClass?: string
  ): string[] {
    if (contextCssClass) {
      return [...cellClassRules, contextCssClass];
    } else {
      const cssClass = this.horisontalLayout()
        ? `key-figure-default-${suffix}`
        : `key-figure-cell-${suffix}`;
      return [...cellClassRules, cssClass];
    }
  }
  onClick(event, routingConfig, element) {
    if (routingConfig && routingConfig.url) {
      const params = {};
      routingConfig.queryParameters.forEach(qp => {
        params[qp.queryParamName] =
          getObject(qp.sourcePath, element) || dot.get(element, qp.sourcePath) || qp.defaultValue;
      });
      this.router.navigate([routingConfig.url], { queryParams: params });
    } else {
      console.warn('No routingconfig provided - navigation cancelled.');
    }
  }
}
