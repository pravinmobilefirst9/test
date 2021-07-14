import { SbLinechartRangeUnit } from './sb-linechart-range-unit';

export interface SbLinechartRangeItem {
  // Label and value matches SelectItem in PrimeNG API - however value is not typed
  label: string;
  value: {
    unit: SbLinechartRangeUnit;
    range: number;
  };
}
