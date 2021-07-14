import { SbLinechartRangeItem } from './sb-linechart-range-item';
import { SbLinechartRangeUnit } from './sb-linechart-range-unit';

export interface SbLinechartDaterange {
  rangeSelectorRanges: SbLinechartRangeItem[];
  rangeSelectorDefaultValue: { unit: SbLinechartRangeUnit; range: number };
}
