import { ActivatedRoute } from '@angular/router';
import { BaseWidgetComponent } from './../base-widget/base-widget.component';
import { SbDataService } from './../../../services/sb-data.service';
import { KeyFigureBasicContext } from './../../../model/key-figure-basic-context';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { SbEventBusService } from 'src/services/sb-event-bus.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from '../../../environments/environment'

@Component({
  selector: 'app-key-figure-basic',
  templateUrl: './key-figure-basic.component.html',
  styleUrls: ['./key-figure-basic.component.scss']
})
export class KeyFigureBasicComponent extends BaseWidgetComponent implements OnInit, OnDestroy {
  @Input() context: KeyFigureBasicContext;
  data: any;
  title: string;
  badge: string;
  detail: string;
  loading = false;
  public clientName: string = environment.client.clientName; // imported from environments.ts

  constructor(dataService: SbDataService, eventBus: SbEventBusService,
    activatedRoute: ActivatedRoute, protected spinner: NgxSpinnerService) {
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
    this.data = responseData;
    this.title = responseData['title'];
    this.badge = responseData['badge'];
    this.detail = responseData['value'];
  }
}
