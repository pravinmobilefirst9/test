import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
  selector: 'app-card-wrapper',
  template: `
    <div class="card card-w-title ui-g-12">
      <h2 class="sb-card-wrapper-header" *ngIf="to.label">{{ to.label }}</h2>
      <ng-container #fieldComponent></ng-container>
    </div>
  `
})
export class CardWrapperComponent extends FieldWrapper {
  @ViewChild('fieldComponent', { read: ViewContainerRef, static: true })
  fieldComponent: ViewContainerRef;
}

@Component({
  selector: 'app-fieldset-wrapper',
  template: `
    <p-fieldset [legend]="to.label">
      <ng-container #fieldComponent></ng-container>
    </p-fieldset>
  `
})
export class FieldsetWrapperComponent extends FieldWrapper {
  @ViewChild('fieldComponent', { read: ViewContainerRef, static: true })
  fieldComponent: ViewContainerRef;
}

@Component({
  selector: 'app-small-card-wrapper',
  template: `
    <div class="card card-w-title ui-g-12">
      <h2 *ngIf="to.label">{{ to.label }}</h2>
      <ng-container #fieldComponent></ng-container>
    </div>
  `
})
export class SmallCardWrapperComponent extends FieldWrapper {
  @ViewChild('fieldComponent', { read: ViewContainerRef, static: true })
  fieldComponent: ViewContainerRef;
}

@Component({
  selector: 'app-filler',
  template: `
    <span #fieldComponent></span>
  `
})
export class SbFillerComponent extends FieldWrapper {
  @ViewChild('fieldComponent', { read: ViewContainerRef, static: true })
  fieldComponent: ViewContainerRef;
}
