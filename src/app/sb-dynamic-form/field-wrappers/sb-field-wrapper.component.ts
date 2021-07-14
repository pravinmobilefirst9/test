import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
  selector: 'app-input-field',
  template: `
    <div *ngIf="to.label && to.hideLabel !== true" class="ui-widget">
      <label>
        {{ to.label }}
        <span *ngIf="to.required && to.hideRequiredMarker !== true">*</span>
      </label>
    </div>
    <div class="this.type !== 'sb-dropdown' ? sb-formly-field : ''">
      <ng-container #fieldComponent></ng-container>
      <div class="md-inputfield">
        <div class="ui-message ui-messages-error" *ngIf="showError">
          <formly-validation-message
            [field]="field"
          ></formly-validation-message>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .sb-formly-field {
        margin-top: 20px;
      }

      .ui-messages-error {
        margin: 0;
        margin-top: 4px;
      }
    `
  ]
})
export class SbWrapperFormFieldComponent extends FieldWrapper {
  @ViewChild('fieldComponent', { read: ViewContainerRef, static: true })
  fieldComponent: ViewContainerRef;
}
