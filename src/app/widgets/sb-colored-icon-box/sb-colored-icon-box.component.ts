import { BaseWidgetComponent } from './../base-widget/base-widget.component';
import { Component, OnInit, Input } from '@angular/core';
import { SbColoredIconBoxContext } from 'src/model/sb-colored-icon-box-context';
import { SbDataService } from 'src/services/sb-data.service';
import { SbEventBusService } from 'src/services/sb-event-bus.service';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import {environment} from '../../../environments/environment'

@Component({
  selector: 'app-sb-colored-icon-box',
  templateUrl: './sb-colored-icon-box.component.html',
  styleUrls: ['./sb-colored-icon-box.component.scss']
})
export class SbColoredIconBoxComponent extends BaseWidgetComponent
  implements OnInit {
  @Input() context: SbColoredIconBoxContext;
  icon: string;
  title: string;
  value: string;
  colorTheme: number;
  public clientName: string =environment.client.clientName; // imported from environments.ts

  constructor(dataService: SbDataService, eventBus: SbEventBusService, activatedRoute: ActivatedRoute,  protected spinner: NgxSpinnerService) {
    super(dataService, eventBus, activatedRoute, spinner);
    this.responseHandler = this.setData;
  }

  ngOnInit() {
    this.icon = this.context.icon;
    this.title = this.context.title;
    this.colorTheme = this.context.colorTheme;
    super.ngOnInit();
  }
  private setData(responseData) {
    this.value = responseData['value'];
  }
}
