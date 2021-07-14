import { FieldType } from '@ngx-formly/core';
import { Component } from '@angular/core';
import { getMultiSelectDisplayText } from '../../utils';

@Component({
  selector: 'app-sb-multiselect',
  template: `
    <span class="ui-float-label">
      <mat-form-field>
        <mat-select [formControl]="formControl"
          placeholder="{{to.label}}"
          [multiple]="true"
          [formlyAttributes]="field"
          [class.ng-dirty]="showError"
          [id]="key">
          <app-sb-multiselect-check-all [model]="form.get(key)" [values]="to.options">
          </app-sb-multiselect-check-all>
            <mat-option *ngFor="let option of to.options" [value]="option.value">
              {{option.label}}
            </mat-option>
        </mat-select>
      </mat-form-field>
    </span>
  `
})
export class SbMultiSelectFormComponent extends FieldType {

  getDisplayText(options) {
    return getMultiSelectDisplayText(options, this.formControl);
  }

}
