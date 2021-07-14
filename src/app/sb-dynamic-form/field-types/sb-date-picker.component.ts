import { Component, ViewChild, ElementRef, Input, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { FormControl } from '@angular/forms';
import { Calendar } from 'primeng/calendar';
import { utc } from 'moment';

@Component({
  selector: 'app-sb-date-picker',
  template: `
    <span class="ui-float-label">
      <mat-form-field style="display: block !important;">
        <mat-label [for]="key">{{ to.label }}</mat-label>
        <input matInput
          [matDatepicker]="picker"
          [class.ng-dirty]="showError"
          [formControl]="formControl"
          [formlyAttributes]="field"
          (onBlur)="onBlur($event)"
          (keydown.enter)="onEnter($event)"
          (dateChange)="onSelect($event)"
        >
        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
      </mat-form-field>
    </span>
  `
})
export class SbDatePickerComponent extends FieldType implements OnInit {
  formControl: FormControl;
  defaultFormat = 'yy-mm-dd';
  maxDate: Date;
  minDate: Date;
  @ViewChild(Calendar, { static: true }) private _calendar: Calendar;

  ngOnInit() {
    // Convert to a date object if the current value is
    // represented as a date string, which is expected if
    // the date was persisted as JSON in the first instance.
    // e.g, 2019-04-16T22:00:00.000Z
    if (typeof this.formControl.value === 'string') {
      const date = new Date(this.formControl.value);
      const dateValue = this.getUTCDate(date);
      this.formControl.setValue(dateValue);
    } else if (this.formControl.value instanceof Date) {
      // Stripping the time part of our dates.
      const dateValue = this.getUTCDate(this.formControl.value);
      this.formControl.setValue(dateValue);
    }
    this.maxDate = new Date();
  }

  onEnter(event) {
    // Need to intercept enter to patch the selectedDate BEFORE the form is submitted.
    if (event.target.value) {
      const date = new Date(event.target.value);
      const dateValue = this.getUTCDate(date);
      this.patchDateValue(dateValue);
    }
  }

  onSelect(selectedDate) {
    if (selectedDate) {
      this.patchDateValue(selectedDate.value);
    }
  }

  onBlur(event) {
    if (event.target.value) {
      const date = new Date(event.target.value);
      const dateValue = this.getUTCDate(date);
      this.patchDateValue(dateValue);
    }
  }

  patchDateValue(value) {
    const date = new Date(value);
    const utcDate = this.getUTCDate(date);
    this.formControl.patchValue(utcDate);
  }

  getUTCDate(date: Date) {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0));
  }
}
