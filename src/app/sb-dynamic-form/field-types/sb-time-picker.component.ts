import { Component, ViewChild, ElementRef, Input, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { FormControl } from '@angular/forms';
import { Calendar } from 'primeng/calendar';

@Component({
  selector: 'app-sb-time-picker',
  template: `
    <mat-form-field style="display: block !important;">
    <mat-label>{{to.label}}</mat-label>
      <input matInput
      type="time"
      [class.ng-dirty]="showError"
      [formControl]="formControl"
      [placeholder]="to.label"
      [formlyAttributes]="field">
    </mat-form-field>
  `
})
export class SbTimePickerComponent extends FieldType implements OnInit {
  formControl: FormControl;
  @ViewChild(Calendar, { static: true }) private _calendar: Calendar;

  ngOnInit() {
    // Convert to a date object if the current value is
    // represented as a date string, which is expected if
    // the date was persisted as JSON in the first instance.
    // e.g, 2019-04-16T22:00:00.000Z
    if (typeof this.formControl.value === 'string') {
      const dateValue = new Date(this.formControl.value);
      this.formControl.setValue(dateValue);
    }
  }
}
