import { ActivatedRoute } from '@angular/router';
import {
  Component,
  OnInit,
  Input,
  OnDestroy
} from '@angular/core';
import { SelectItem } from 'primeng/primeng';
import { SbMultiSelectContext } from 'src/model/sb-multi-select-context';
import { SbDataService } from 'src/services/sb-data.service';
import { SbEventBusService } from 'src/services/sb-event-bus.service';
import { BaseWidgetComponent } from '../base-widget/base-widget.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { getMultiSelectDisplayText } from '../../utils';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sb-multi-select',
  templateUrl: './sb-multi-select.component.html',
  styleUrls: ['./sb-multi-select.component.scss']
})
export class SbMultiSelectComponent extends BaseWidgetComponent
  implements OnInit, OnDestroy {
  @Input() context: SbMultiSelectContext;
  public clientName: string =environment.client.clientName; // imported from environments.ts

  dataOptions: SelectItem[];
  selectedMultiSelectOptions;
  label: string;
  placeHolder = 'Search';
  loaded: Boolean = false;

  constructor(
    dataService: SbDataService,
    eventBus: SbEventBusService,
    activatedRoute: ActivatedRoute,
    protected spinner: NgxSpinnerService
  ) {
    super(dataService, eventBus, activatedRoute, spinner);
    this.responseHandler = this.setData;
  }

  ngOnInit() {
    this.label = this.context.label || 'Choose';
    this.placeHolder = this.context.filterPlaceHolder || 'Search';

    super.ngOnInit();
  }


  getDisplayText(options) {
    return getMultiSelectDisplayText(options, this.selectedMultiSelectOptions);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  private setSelectedOptionsFromState() {
    try {
      if (this.eventBus.hasStateStored(this.context.topic)) {
        const payload = this.eventBus.getLastEvent(this.context.topic).payload;
        if (payload) {
          this.selectedMultiSelectOptions = payload.value;
        }
      }
    } catch (e) {
      console.warn(e);
    }
  }

  private setData(responseData: any) {
    this.dataOptions = responseData;
    this.selectedMultiSelectOptions = this.dataOptions.map(el => el.value);
    this.setSelectedOptionsFromState();

    if (
      this.context.allSelectedByDefault &&
      !(this.eventBus.hasStateStored(this.context.topic) && this.eventBus.getLastEvent(this.context.topic).payload)
    ) {
      this.onChange({
        value: this.selectedMultiSelectOptions
      });
    }
  }

  onChange(event) {
    const payload = {
      source: this.context.source,
      topic: this.context.topic,
      payload: {
        itemValue: event.itemValue,
        value: event.value
      }
    };
    try {
      this.eventBus.emit(payload);
    } catch (e) {
      console.log(e);
    }
  }
}
