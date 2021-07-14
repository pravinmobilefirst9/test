import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { SbPath } from 'src/model/sb-path';
import { SbWidgetContext } from 'src/model/sb-widget-context';
import { unitOfTime } from 'moment';

export interface ValueLabelConfig {
  key: string;
  path: string;
}

export interface FieldMapping {
  source: string;
  target: string;
  targetType?: string;
  valueLabel?: boolean;
}

export interface FieldDefaultValue {
  target: string;
  value?: any;
  valueSource?: FormValueSourceEnum;
  sourcePath?: string;
  dateOffset?: DateOffset;
  excludeInSavedFilters?: boolean;
}

export class DateOffset {
  // Todo - not all unitsOfTime are handled. Maybe just use Base or DurationConstructor
  unit: unitOfTime.All;
  offset: number;
  startOfUnit: boolean;
  endOfUnit: boolean;
  includeWeekends: boolean;
  includeBankHolidays: boolean;
}

export enum FormValueSourceEnum {
  Route = 'Route',
  UserProperty = 'UserProperty',
  LastSaved = 'LastSaved',
  Value = 'Value'
}

export interface FieldCopy {
  source: string;
  target: string;
  overwriteIfSet?: boolean;
}

export interface CalculatedField {
  target: string;
  mathExpression: string;
  fields: any;
}

export enum FormType {
  Default = 'Default',
  Filter = 'Filter'
}

export interface FormConfigContext extends SbWidgetContext {
  requireConfirmation: boolean;
  formId: string;
  title: string;
  formlyFieldConfigs: FormlyFieldConfig[];
  options?: FormlyFormOptions;
  path: SbPath;
  collection: string;
  model?: any;
  optionDatas?: ValueLabelConfig[];
  formModelMapping?: FieldMapping[];
  defaultValues?: FieldDefaultValue[];
  redirectPathOnSuccess: string;
  copy?: FieldCopy[];
  calculatedFields?: CalculatedField[];
  formType?: FormType;
}
