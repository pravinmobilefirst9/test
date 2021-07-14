import { SbDataService } from './../../../services/sb-data.service';
import {
  Component,
  OnInit,
  Input,
  ViewEncapsulation,
  OnDestroy
} from '@angular/core';
import { getStartDateOfUnit, getDeltaOfUnit } from 'src/app/date-utils';
import * as Highcharts from 'highcharts/highstock';
import { SbLineChartContext } from 'src/model/sb-line-chart-context';
import { SbLinechartComparison } from 'src/model/sb-linechart/sb-linechart-comparison';
import { SbLinechartRangeItem } from 'src/model/sb-linechart/sb-linechart-range-item';
import { SbLinechartRangeUnit } from 'src/model/sb-linechart/sb-linechart-range-unit';
import { HttpParams } from '@angular/common/http';
import { SbEventBusService } from 'src/services/sb-event-bus.service';
import { SbEventTopic } from 'src/services/sb-event-topic';
import { SbHost } from 'src/model/sb-host-enum';
import { BaseWidgetComponent } from '../base-widget/base-widget.component';
import { ActivatedRoute } from '@angular/router';
import { SbEvent } from 'src/services/sb-event';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatFormFieldDefaultOptions, MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { environment } from 'src/environments/environment';
// set default form field appearance as fill for this component
const appearance: MatFormFieldDefaultOptions = {
  appearance: 'outline'
};
@Component({
  selector: 'app-sb-linechart',
  templateUrl: './sb-linechart.component.html',
  styleUrls: ['./sb-linechart.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: appearance
    }
  ],
})
export class SbLinechartComponent extends BaseWidgetComponent
  implements OnInit, OnDestroy {
  @Input() context: SbLineChartContext;

  public clientName: string =environment.client.clientName; // imported from environments.ts
  comparisons: SbLinechartComparison[];
  compareToValue: any;
  dataSeries: any[];
  dateRangeValues: SbLinechartRangeItem[];
  selectedDateRange: any;
  chartInstance: Highcharts.Chart;
  fromDate: Date;
  toDate: Date;
  /* START HIGHCHARTS STUFF */
  Highcharts = Highcharts; // required
  chartConstructor = 'chart'; // optional string, defaults to 'chart'
  // Todo - remove after testing.
  chartOptions: Highcharts.Options;
  updateFlag = true; // optional boolean
  oneToOneFlag = true; // optional boolean, defaults to false
  runOutsideAngular = true; // setting this to true will not trigger angular change detection events from chart.
  chartCallback = function (chart) { }; // optional function, defaults to null
  /* END HIGHCHARTS STUFF */
  constructor(
    dataService: SbDataService,
    eventBus: SbEventBusService,
    activatedRoute: ActivatedRoute,
    protected spinner: NgxSpinnerService
  ) {
    super(dataService, eventBus, activatedRoute, spinner);
    // Todo - do we really want to autotrigger dataload here?
    this.autoTriggerDataLoad = true;
    this.responseHandler = this.setData;
  }

  ngOnInit() {
    console.log(this.compareToValue);
    this.dataSeries = [];
    if (this.context.rangeSelector) {
      this.dateRangeValues = this.context.rangeSelector.rangeSelectorRanges;
      this.selectedDateRange = this.context.rangeSelector.rangeSelectorDefaultValue;
    }

    this.chartOptions = this.getChartOptions();
    super.ngOnInit();
    this.setComparisonSeries();
    this.registerEventListeners();
  }

  private setData(responseData: any) {
    this.dataSeries = [responseData];
    if (responseData.hasOwnProperty('data') && responseData.data.length > 0) {
      // Assuming that 2 values per datapoint means one graph.
      if (responseData.data[0].length === 2) {
        Object.assign(responseData, {
          type: 'area'
        });
      }
    }
    this.chartOptions = Object.assign(
      {
        series: this.dataSeries
      },
      this.context.chartOptions || {}
    );
    // Clear set benchmark if we are reloading data.
    this.compareToValue = null;
    // Workaround to make chart fully expand to container size - Should be fixed through css.
    setTimeout(() => {
      this.chartInstance.reflow();
    });
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  registerEventListeners(): any {
    const sub = this.eventBus.getObservable(SbEventTopic.TabPanelTabChange).subscribe(event => {
      // Todo - we have to validate that we are in the tab that's being changed to - otherwise exception here.
      setTimeout(() => {
        this.chartInstance.reflow();
      });
    });
    this.subscriptions.push(sub);
  }

  private setComparisonSeries() {
    this.dataService
      .getDataWithParams(
        this.context.availableCompareValuesPath,
        // Todo - what parameters to send here? Reasonably the same as for the line chart data?
        new HttpParams(),
        SbHost.GatewayBaseUrl
      )
      .subscribe(res => {
        this.comparisons = res;
      });
  }

  onComparisonSeriesSelected() {

    if (!this.compareToValue) {
      const numberOfSeries = this.chartOptions.series.length;
      if (numberOfSeries > 1) {
        this.chartOptions.series.splice(numberOfSeries - 1, 1);
        this.updateFlag = true;
      }
    } else {
      this.dataService
        .getDataWithParams(
          this.context.comparisonPath,
          new HttpParams().set('comparison', this.compareToValue),
          SbHost.GatewayBaseUrl
        )
        .subscribe(dataSeries => {
          // Not sure how fast this is but it works for now.
          const filtered = this.dataSeries.filter(ds => ds.name !== dataSeries.name);
          // Filter benchmarks plot time series to overlap with existing time series data in the chart
          const timePoints = filtered.reduce((acc, series) => {
            series.data.forEach(vector => {
              acc = acc.concat(vector[0]);
            });
            return acc;
          }, []);
          const firstTime = Math.min(...timePoints);
          const filteredDataSeries = dataSeries.data.filter(vector => vector[0] >= firstTime);
          const benchmark = Object.assign(dataSeries, { data: filteredDataSeries }, { color: 'orange' });
          this.chartOptions.series = filtered.concat(benchmark);
          this.updateFlag = true;
        });
    }
  }

  getChartOptions(): Highcharts.Options {
    return {
      chart: {
        // Making highcharts just use css styling, no presentational attributes are applied to the chart SVG
        // https://api.highcharts.com/highcharts/chart.styledMode
        // styledMode: true
        events: {
          // Having to call load data after chart is redrawn due to getting
          // to and from dates from extremes if they aren't explicitly set in filters or httpParameters.
          redraw: function (e) {
            this.chartRedrawn(e);
          }.bind(this)
        }
      },
      plotOptions: {
        series: {
          compare: this.context.compare,
          showInNavigator: true
        },
        area: {
          fillColor: {
            linearGradient: {
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 1
            },
            stops: [
              // Use Highcharts.getOptions to get our first chart color when we've cleaned up highcharts config.
              [0, '#3c40c6'],
              // [0, Highcharts.getOptions().colors[0]],
              [1, new Highcharts.Color('#3c40c6').setOpacity(0).get('rgba').toString()]
              // [1, new Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba').toString()]
            ]
          },
          marker: {
            radius: 2
          },
          lineWidth: 1,
          states: {
            hover: {
              lineWidth: 1
            }
          },
          threshold: null
        }
      },
      legend: {
        enabled: false
      },
      colors: [
        '#3c40c6',
        '#0fbcf9',
        '#a6d1ff',
        '#00d8d6',
        '#485460',
        '#d2dae2',
        '#ffa801',
        '#ffdd59',
        '#05c46b',
        '#ff5e57'
      ],
      xAxis: {
        // Todo - get from field setting - or chart setting
        type: 'datetime'
      },
      yAxis: {
        opposite: true,
        labels: {
          format: this.context.compare === 'percent' ? '{value} %' : 'value'
        }
      },
      tooltip: {
        // Todo - enable in config
        pointFormat: this.getPointFormatForTooltip(),
        valueDecimals: 2,
        shared: true
      }
    };
  }
  getPointFormatForTooltip(): string {
    return this.context.compare
      ? this.context.compare === 'percent'
        ? '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>'
        : '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change})<br/>'
      : Highcharts.defaultOptions.tooltip.pointFormat;
  }

  saveChartInstance(chart: Highcharts.Chart) {
    this.chartInstance = chart;
  }

  onDateRangeChange(event: MatButtonToggleChange) {
    this.selectedDateRange = event.value;
    this.onDateRangeClicked();
  }

  onDateRangeClicked() {
    const extremes = this.chartInstance.xAxis[0].getExtremes();
    // for some reason the initial values of max and min no longer corresponds to dataMax and dataMin
    // if we haven't manually set max or min values (userMax/userMin undefined) we'll assume dataMax should be the max date value
    const maxTime = extremes.userMax ? new Date(extremes.max) : new Date(extremes.dataMax);
    const dataMin = extremes.dataMin;
    const dataMax = extremes.dataMax;

    let startTime: Date;
    let endTime: Date;
    switch (this.selectedDateRange.unit) {
      case SbLinechartRangeUnit.month:
      case SbLinechartRangeUnit.year:
      case SbLinechartRangeUnit.week:
        startTime = getDeltaOfUnit(maxTime, this.selectedDateRange.unit, -this.selectedDateRange.range);
        endTime = maxTime;
        break;
      case SbLinechartRangeUnit.day:
        console.log('Reload data with day data if 1D, else?');
        break;
      case SbLinechartRangeUnit.ytd:
        // Should we set to data max here - or use today's date like implemented?
        const today = new Date();
        startTime = getStartDateOfUnit(today, 'year');
        endTime = today;
        break;
      case SbLinechartRangeUnit.all: {
        startTime = new Date(dataMin);
        endTime = new Date(dataMax);
        break;
      }
      default:
        throw Error(
          `Unknown date unit: ${this.selectedDateRange.unit} when date range button clicked. `
        );
    }
    this.setStartAndEndDates(startTime, endTime);
  }

  handleFilterEvent(event: SbEvent) {
    super.handleFilterEvent(event);

    if (event.payload.hasOwnProperty('fromDate') && event.payload.hasOwnProperty('toDate')) {
      // Since we are getting a custom range, deselect predefined range in range picker.
      this.selectedDateRange = null;
      this.setStartAndEndDates(event.payload.fromDate, event.payload.toDate);
    }
  }

  private setStartAndEndDates(startTime: any, endTime: any) {
    this.fromDate = startTime;
    this.toDate = endTime;
    this.chartInstance.xAxis[0].setExtremes(startTime.valueOf(), endTime.valueOf());
  }

  private fromDateSelected(event: any) {
    this.selectedDateRange = null;
    this.fromDate = event.value;
    this.setStartAndEndDates(this.fromDate, this.toDate);
  }

  private toDateSelected(event: any) {
    this.selectedDateRange = null;
    this.toDate = event.value;
    this.setStartAndEndDates(this.fromDate, this.toDate);
  }

  private chartRedrawn(e: any) {
    // if we haven't set date picker dates externally or through parameters in route,
    // query or event we set them explicitly from the max and min date in the chart axis
    if (!this.fromDate || !this.toDate) {
      const chart: Highcharts.Chart = e.target;
      if (chart.series.length > 0) {
        const extremes = chart.xAxis[0].getExtremes();
        this.fromDate = new Date(extremes.dataMin);
        this.toDate = new Date(extremes.dataMax);
      }
    }
  }

  /**
   * Used by angular mat-select to compare select options when they can't be compared with just === like a single string value
   */
  dateRangeComparator(i1, i2) {
    return i1.unit === i2.unit && i1.range === i2.range;
  }
}
