import { Component, ViewChild, ElementRef, Input } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'app-sb-input-switch',
  template: `
    <label for="key" style="margin-right: 10px">{{ to.label }}</label>
    <mat-slide-toggle
      [class.ng-dirty]="showError"
      [formlyAttributes]="field"
      [formControl]="formControl"
    ></mat-slide-toggle>
  `
})
export class SbSwitchComponent extends FieldType {}
