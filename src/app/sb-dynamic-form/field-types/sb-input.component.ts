import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy
} from '@angular/core';
import { SbFieldComponent } from './sb-field-utils';
import { DecimalPipe } from '@angular/common';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';

@Component({
  selector: 'app-sb-input',
  template: `
    <span class="ui-float-label">
      <mat-form-field style="display: block !important;">
      <mat-label>{{ to.label }}</mat-label>
        <input matInput
        [id]="key"
        [type]="to.type || 'text'"
        [formControl]="formControl"
        [formlyAttributes]="field"
        [class.ng-dirty]="showError"
        [pKeyFilter]="to.keyFilter || matchAll()"
        [ngClass]="getClass()"
        [readonly]="to.readonly"
        [textMask]="getTextMask()"
        [pTooltip]="getTooltip()"
        [tooltipPosition]="getTooltipPosition()"
        [tooltipEvent]="getTooltipEvent()"
        #inputElement
        (change)="unmask($event.target.value)"
        (keypress)="onModelChange()"
        >
      </mat-form-field>
    </span>
  `
})
export class SbInputComponent extends SbFieldComponent {
  @ViewChild('inputElement', { static: true }) input: ElementRef;

  matchAll() {
    return /(.*?)/;
  }

  unmask(value) {
    if (this.to.type === 'decimal' && value) {
      this.formControl.patchValue(value.replace(/ /gi, ''));
    }
  }

  getTooltip() {
    return this.to.tooltip || null;
  }

  getTooltipPosition() {
    return this.to.tooltipPosition || 'top';
  }

  getTooltipEvent() {
    return this.to.tooltipEvent || 'focus';
  }

  onModelChange() {
    if (this.to.type === 'isin' && this.formControl.value) {
      this.formControl.patchValue(this.formControl.value.toUpperCase());
    }
  }

  getTextMask() {
    if (this.to.type === 'decimal') {
      return {
        mask: createNumberMask({
          prefix: '',
          allowDecimal: true,
          thousandsSeparatorSymbol: ' ',
          decimalLimit: 6,
          allowNegative: this.to.allowNegative
        })
      };
    } else if (this.to.type === 'positive-integer') {
      return {
        mask: createNumberMask({
          prefix: '',
          allowDecimal: false,
          allowNegative: false,
          thousandsSeparatorSymbol: ' ',
          integerLimit: 6
        })
      };
    } else {
      return { mask: false };
    }
  }
}
