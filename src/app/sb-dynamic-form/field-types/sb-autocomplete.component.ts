import { FieldType, Field, FormlyFieldConfig } from '@ngx-formly/core';
import {
  Component,
  OnInit,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AutoComplete } from 'primeng/autocomplete';
import { SbFieldComponent } from './sb-field-utils';
import { getFormComponentItemtext } from 'src/app/utils';
import { SbAuthenticationService } from 'src/app/auth/sb-authentication.service';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-sb-autocomplete',
  template: `
    <span class="ui-float-label">
      <mat-form-field style="display: block !important;">
      <input type="text"
             placeholder="{{ to.label }}"
             matInput
             [formControl]="formControl"
             [matAutocomplete]="key"
             (focus)="onFocus($event)">
      <mat-autocomplete #key="matAutocomplete" [displayWith]="displayWithFn">
          <mat-option *ngFor="let option of filteredItems" [value]="option">
          {{ getElementText(option) }}
          </mat-option>
      </mat-autocomplete>
    </mat-form-field>
    </span>
  `
})
export class SbAutoCompleteComponent extends SbFieldComponent
  implements OnInit, AfterViewInit {
  constructor(
    private http: HttpClient,
    private authentication: SbAuthenticationService
  ) {
    super();
  }

  @ViewChild('autoComplete', { static: true }) autoComplete: AutoComplete;
  filteredItems: any[] | Observable<any[]>;

  onSelect(event) {
    console.log(JSON.stringify(event));
  }

  ngAfterViewInit() {
    // if (this.to.readonly) {
    //   this.autoComplete.inputEL.nativeElement.tabIndex = -1;
    // }
    // this.autoComplete.inputEL.nativeElement.autocomplete = 'off';
    // Disable tabbing of dropdown button so that the next
    // input field gets focus instead instead of having to tab twice.
    // this.autoComplete.dropdownButton.nativeElement.tabIndex = -1;
  }

  ngOnInit() {
    this.formControl.valueChanges.pipe(debounceTime(500)).subscribe(
      value => {
        this.filter(value);
      }
    );
    setTimeout(() => {
      if (
        this.formControl.value &&
        typeof this.formControl.value !== 'object' &&
        this.field.templateOptions.options &&
        typeof this.field.templateOptions.options === 'object' &&
        this.field.templateOptions.options.constructor === Array
      ) {
        const optionsArray = this.field.templateOptions.options as any[];
        const valueLabel = optionsArray.find(vl => {
          return vl.value === this.formControl.value;
        });
        this.formControl.setValue(valueLabel || this.formControl.value);
      } else if (!this.formControl.value) {
        this.formControl.setValue(this.field.templateOptions.defaultValue);
      } else if (this.formControl.value && this.to.idField && this.field.templateOptions.options) {
        // Try to find the value based on the id
        const key = this.formControl.value[this.to.idField];
        if (this.field.templateOptions.options instanceof Array) {
          const optionsArray = this.field.templateOptions.options as Array<any>;
          optionsArray.forEach(element => {
            if (element[this.to.idField] === key) {
              this.formControl.setValue(element);
            }
          }
          );
        }
      }
    });
  }

  displayWithFn = argument => {
    return this.displayFn(argument, this.to);
  }

  // Mat Autocomplete Display Method
  displayFn(option: any, templateOptions): any {
    if (this.to && this.to.field && option) {
      return option[this.to.field];
    } else if (option && option.label) {
      return option.label;
    } else {
      return option;
    }
  }

  onFocus(event) {
    this.filter('');
  }

  getElementText(item) {
    return getFormComponentItemtext(
      item,
      this.field.templateOptions.templateFields
    );
  }

  getField() {
    // If filteredItems contains objects then we need to define which is the value to
    // represent in the GUI
    if (this.field.templateOptions.field) {
      return this.field.templateOptions.field;
    } else {
      return '';
    }
  }

  filter(event) {
    if (this.field.templateOptions.options) {
      this.filteredItems = this.localQuery(
        this.field.templateOptions.options as any[],
        event
      );
    } else if (this.field.templateOptions.optionsURL) {
      this.remoteQuery(this.field.templateOptions.optionsURL, event);
    } else {
      console.error('Invalid arguments provided to fetch remote data.');
    }
  }

  localQuery(options: any[], query: any): any[] {
    let queryOption;
    if (query && query.label) {
      queryOption = query.label;
    } else if (query && query.instrumentName) {
      queryOption = query.instrumentName;
    } else {
      queryOption = query;
    }
    return options.filter(word => {
      if (typeof word === 'string' && queryOption) {
        return word.toLowerCase().indexOf(queryOption.toLowerCase()) !== -1;
      }
      if (word.hasOwnProperty('label') && word.label && typeof queryOption === 'string') {
        return word.label.toLowerCase().indexOf(queryOption.toLowerCase()) !== -1;
      } else {
        const values = Object.keys(word).map(key => word[key]);
        const exists = values.find(text => {
          return (
            (typeof text === 'string' && typeof queryOption === 'string') &&
            text.toLowerCase().indexOf(queryOption.toLowerCase()) !== -1
          );
        });
        return exists;
      }
    });
  }
  remoteQuery(url: string, query: string) {
    const headers = this.authentication.getHeaderWithToken();
    this.http
      .get<any>(`${url}?q=${encodeURIComponent(query)}`, { headers })
      .subscribe(data => {
        this.filteredItems = data;
      });
  }
}
