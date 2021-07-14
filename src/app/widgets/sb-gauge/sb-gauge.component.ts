import { BaseWidgetComponent } from './../base-widget/base-widget.component';
import { SbGaugeContext } from './../../../model/sb-gauge-context';
import { SbDataService } from './../../../services/sb-data.service';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import { SbEventBusService } from 'src/services/sb-event-bus.service';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-sb-gauge',
  templateUrl: './sb-gauge.component.html',
  styleUrls: ['./sb-gauge.component.scss']
})
export class SbGaugeComponent extends BaseWidgetComponent
  implements OnInit, OnDestroy {
  @Input() context: SbGaugeContext;

  public clientName: string =environment.client.clientName; // imported from environments.ts
  /* START HIGHCHARTS STUFF */
  Highcharts = Highcharts; // required
  chartConstructor = 'chart'; // optional string, defaults to 'chart'
  // Todo - remove after testing.
  chartOptions: Highcharts.Options = {
    chart: {
      type: 'solidgauge',
      styledMode: true
    },
    pane: {
      center: ['50%', '95%'],
      size: '190%',
      startAngle: -90,
      endAngle: 90,
      background: [
        {
          outerRadius: '100%',
          innerRadius: '30%',
          shape: 'arc',
          borderColor: 'transparent'
        }
      ]
    },
    yAxis: {
      lineWidth: 0,
      minorTickInterval: null,
      tickPixelInterval: 0,
      tickWidth: 0,
      min: 0,
      max: 100
    },
    plotOptions: {
      solidgauge: {
        // @ts-ignore: Type definition mismatch in Highchart API
        innerRadius: '30%',
        dataLabels: {
          y: 5,
          borderWidth: 0,
          useHTML: true
        }
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

  private setData(responseData: any) {
    const value = responseData['value'];

    this.chartOptions = Object.assign(
      {},
      this.chartOptions,
      {
        title: {
          text: this.context.title
        },
        yAxis: {
          lineWidth: 0,
          minorTickInterval: null,
          tickPixelInterval: 0,
          tickWidth: 0,
          min: this.context.min,
          max: this.context.max
        },
        series: {
          data: [+value]
        }
      },
      this.context.chartOptions || {}
    );
  }
}
