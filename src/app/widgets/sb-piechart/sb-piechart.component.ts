import { BaseWidgetComponent } from './../base-widget/base-widget.component';
import { SbPieChartData } from './../../../model/sb-pie-chart-data';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import { SbPieChartContext } from 'src/model/sb-pie-chart-context';
import { SbDataService } from 'src/services/sb-data.service';
import { SbEventBusService } from 'src/services/sb-event-bus.service';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sb-piechart',
  templateUrl: './sb-piechart.component.html',
  styleUrls: ['./sb-piechart.component.scss']
})
export class SbPiechartComponent extends BaseWidgetComponent
  implements OnInit, OnDestroy {
  @Input() context: SbPieChartContext;
  public clientName: string =environment.client.clientName; // imported from environments.ts
  /* START HIGHCHARTS STUFF */
  Highcharts = Highcharts; // required
  chartOptions: Highcharts.Options = {
    chart: {
      // Making highcharts just use css styling, no presentational attributes are applied to the chart SVG
      // https://api.highcharts.com/highcharts/chart.styledMode
      styledMode: true,
      type: 'pie',
      height: 200
    },
    title: {
      text: null
    },
    legend: {
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'middle',
      borderWidth: 0,
      useHTML: true,
      itemMarginBottom: 10,
      labelFormatter: function () {
        // Todo - use global formatter functions
        const percentageAsLabel = (this instanceof Highcharts.Point) ? this.percentage.toFixed(2) : '';
        const yAsLabel = (this instanceof Highcharts.Point) ? Highcharts.numberFormat(this.y, 0) : '';
        return (
          '<div class="sb-highcharts-pie-series-item"><span style="float:left">' +
          this.name +
          '</span><span style="float:right">' +
          percentageAsLabel +
          '%</span><span style="float:right; margin-right:8%">' +
          yAsLabel +
          '</span></div>'
        );
      }
    },
    plotOptions: {
      pie: {
        cursor: 'pointer',
        dataLabels: {
          enabled: false
        },
        showInLegend: true
      }
    }
  }; // required
  updateFlag = false; // optional boolean
  oneToOneFlag = true; // optional boolean, defaults to false
  runOutsideAngular = false; // setting this to true will not trigger angular change detection events from chart.
  chartCallback = function (chart) { }; // optional function, defaults to null
  /* END HIGHCHARTS STUFF */
  constructor(dataService: SbDataService, eventBus: SbEventBusService, activatedRoute: ActivatedRoute, protected spinner: NgxSpinnerService) {
    super(dataService, eventBus, activatedRoute, spinner);
    this.responseHandler = this.setData;
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  private setData(responseData) {
    const pieChartSeriesData: SbPieChartData[] = responseData;
    const seriesGroups = this.groupBySeriesName(pieChartSeriesData);
    const rootSeriesName =
      this.context.rootSeriesName || seriesGroups.keys().next().value;
    const drillDownSeries = [];
    const series = [];
    seriesGroups.forEach((value: SbPieChartData[], key: string) => {
      if (key !== rootSeriesName) {
        drillDownSeries.push(this.getSeriesFromPieChartData(value, key));
      } else {
        series.push(this.getSeriesFromPieChartData(value, key));
      }
    });

    this.chartOptions = Object.assign(
      {},
      this.chartOptions,
      this.context.chartOptions,
      {
        series: series,
        drilldown: drillDownSeries
          ? {
            series: drillDownSeries,
            drillUpButton: this.getDrillUpButtonStyle()
          }
          : {}
      }
    );
  }

  groupBySeriesName(
    seriesData: SbPieChartData[]
  ): Map<string, SbPieChartData[]> {
    const map = new Map();
    seriesData.forEach(data => {
      const key = data.seriesName;
      const collection = map.get(key);
      if (!collection) {
        map.set(key, [data]);
      } else {
        collection.push(data);
      }
    });
    return map;
  }

  getSeriesFromPieChartData(sbData: SbPieChartData[], seriesName: string) {
    const data = sbData.map(d => ({
      name: d.displayName,
      y: d.dataPoint,
      drilldown: d.drilldownId
    }));
    return {
      name: seriesName,
      data: data,
      id: seriesName,
      innerSize: this.context.donut ? '70%' : null
    };
  }

  getDrillUpButtonStyle() {
    return {
      relativeTo: 'spacingBox',
      position: {
        y: 0,
        x: 0
      },
      theme: {
        r: 5
      }
    };
  }
}
