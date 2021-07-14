import { FieldFormattingRules } from './field-formatting-rules';
import { SbPath } from './sb-path';
import { SbEventListener, QueryParamConfig } from './sb-event-listener';
export interface SbWidgetContext {
  path: SbPath;
  widgetId: string;
  fields: FieldFormattingRules[];
  filterListeners?: SbEventListener[];
  queryParamsFromRoute?: QueryParamConfig[];
  headerText?: string;
  redirectOptions?: {
    redirectText: string,
    routingConfig: {
      url: string
    }
  }
}
