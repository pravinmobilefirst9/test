import {
  Component,
} from '@angular/core';
import { SbFieldComponent } from './sb-field-utils';
import { OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Options } from 'ng5-slider';

@Component({
  selector: 'app-sb-slider',
  template: `
    <ng5-slider [(ngModel)]="model[field.key]" [(value)]="value" [(highValue)]="highValue" [options]="sliderOptions"></ng5-slider>
  `
})
export class SbSliderComponent extends SbFieldComponent implements OnInit  {
  formControl: FormControl;
  value: number;
  highValue: number;
  sliderOptions: Options = {
    floor: 0,
    ceil: 100
  };
  currentFromRange() {
    if (this.model[this.field.key] && this.to.range) {
      return this.model[this.field.key][0];
    }
  }

  currentToRange() {
    if (this.model[this.field.key] && this.to.range) {
      return this.model[this.field.key][1];
    }
  }

  ngOnInit() {
    this.value = this.to.min;
    this.highValue = this.to.max;
    if (this.model[this.field.key] === undefined && this.to.range) {
      const range = [this.to.min, this.to.max];
      this.formControl.setValue(range);
      // this.field.defaultValue = [this.to.min, this.to.max];
      // this.model[this.field.key] = [this.to.min, this.to.max];
    }
  }

}
