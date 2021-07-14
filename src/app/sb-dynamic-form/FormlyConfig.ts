import { MustMatchValidator } from '../validators/MustMatchValidator';
import {
  CardWrapperComponent,
  FieldsetWrapperComponent,
  SmallCardWrapperComponent,
  SbFillerComponent
} from '../wrappers/card.wrapper';
import { SbWrapperFormFieldComponent } from './field-wrappers/sb-field-wrapper.component';
import { SbDatePickerComponent } from './field-types/sb-date-picker.component';
import { SbSwitchComponent } from './field-types/sb-input-switch';
import { SbInputComponent } from './field-types/sb-input.component';
import { SbDropdownComponent } from './field-types/sb-dropdown.component';
import { SbAutoCompleteComponent } from './field-types/sb-autocomplete.component';
import { SbMultiSelectFormComponent } from './field-types/sb-multiselect.component';
import { SbTimePickerComponent } from './field-types/sb-time-picker.component';
import { ConfigOption, FormlyModule } from '@ngx-formly/core';
import { EmailValidator } from '../validators/EmailValidator';
import { IsinValidator } from '../validators/IsinValidator';
import { SbSliderComponent } from './field-types/sb-slider.component';

export function minlengthValidationMessages(err, field) {
  return `Should have at least ${field.templateOptions.minLength} characters`;
}

/** Configuration of formly components, validators, wrappers etc */
const SB_FORMLY_CONFIG: ConfigOption = {
  validators: [
    { name: 'mustMatch', validation: MustMatchValidator },
    { name: 'email', validation: EmailValidator },
    { name: 'isin', validation: IsinValidator }
  ],
  validationMessages: [
    { name: 'required', message: 'This field is required' },
    { name: 'minlength', message: minlengthValidationMessages },
    { name: 'mustMatch', message: 'Password must match' },
    { name: 'email', message: 'Not a valid e-mail' },
    { name: 'isin', message: 'Not a valid ISIN, e.g., SE0000108656.' }
  ],
  wrappers: [
    { name: 'card', component: CardWrapperComponent },
    { name: 'small-card', component: SmallCardWrapperComponent },
    { name: 'sb-field-wrapper', component: SbWrapperFormFieldComponent },
    { name: 'sb-fieldset-wrapper', component: FieldsetWrapperComponent },
    { name: 'filler', component: SbFillerComponent }
  ],
  types: [
    {
      name: 'sb-datepicker',
      component: SbDatePickerComponent,
      wrappers: ['sb-field-wrapper']
    },
    {
      name: 'sb-switch',
      component: SbSwitchComponent
    },
    {
      name: 'sb-input',
      component: SbInputComponent,
      wrappers: ['sb-field-wrapper']
    },
    {
      name: 'sb-dropdown',
      component: SbDropdownComponent,
      wrappers: ['sb-field-wrapper']
    },
    {
      name: 'sb-autocomplete',
      component: SbAutoCompleteComponent,
      wrappers: ['sb-field-wrapper']
    },
    {
      name: 'sb-multiselect',
      component: SbMultiSelectFormComponent,
      wrappers: ['sb-field-wrapper']
    },
    {
      name: 'sb-timepicker',
      component: SbTimePickerComponent,
      wrappers: ['sb-field-wrapper']
    },
    {
      name: 'sb-slider',
      component: SbSliderComponent,
      wrappers: ['sb-field-wrapper']
    }

  ]
};

export const FORMLY_MODULE = FormlyModule.forRoot(SB_FORMLY_CONFIG);

/** NGX FORMLY related components */
export const FORMLY_COMPONENTS = [
  CardWrapperComponent,
  SbDatePickerComponent,
  SbInputComponent,
  SbWrapperFormFieldComponent,
  SbDropdownComponent,
  SbSwitchComponent,
  SmallCardWrapperComponent,
  SbFillerComponent,
  SbAutoCompleteComponent,
  SbMultiSelectFormComponent,
  SbTimePickerComponent,
  SbSliderComponent
];
