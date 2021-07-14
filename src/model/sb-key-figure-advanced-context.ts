import { RoutingConfig } from './sb-routing-config';
import { QueryParamConfig } from 'src/model/sb-event-listener';
import { SbWidgetContext } from 'src/model/sb-widget-context';

export interface SbKeyFigureAdvancedContext extends SbWidgetContext {
  layout: string;
  labelClass?: string;
  labelInlineStyle?: string;
  valueClass?: string;
  valueInlineStyle?: string;
  columnFormatting?: any[];
  columnHeaders?: any[];
  columnConfiguration?: ColumnConfiguration[];
  columnAlignment?: string[];
  columnFilter?: string[];
  bulletField?: string;
  bullets?: boolean;
  /**
   * Bullet colors can be set by adding css classes to bullets
   * Set key value pairs based on the value in the cell (i.e., the string value from the dataset)
   * Two defaults can be set:
   * 1. EMPTY - if no value is present (i.e., null, undefined, or empty string)
   * 2. DEFAULT - if you want to override the default font color to use as default color for your bullets
   * Finding a match for a value key will override 2.
   */
  bulletColors?: any;
  decimals?: number;
  routingConfig?: RoutingConfig;
}
export interface ColumnConfiguration {
  field: string;
  position: string;
  cssClasses: string[];
  prefix: string;
  suffix: string;
  label?: string;
}
