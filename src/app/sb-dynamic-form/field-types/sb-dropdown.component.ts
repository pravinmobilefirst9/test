import { FieldType } from '@ngx-formly/core';
import { Component } from '@angular/core';

@Component({
  selector: 'app-sb-dropdown',
  template: `
    <mat-form-field>
      <mat-select
        [class.ng-dirty]="showError"
        [placeholder]="to.placeholder"
        [formControl]="formControl"
        [formlyAttributes]="field">
        <mat-option *ngFor="let option of to.options" [value]="option.value">
          {{option.label}}
        </mat-option>
      </mat-select>
    </mat-form-field>
  `
})
export class SbDropdownComponent extends FieldType {
  defaultOptions = {
    templateOptions: { options: [] }
  };
}
