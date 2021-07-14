import { SbWidgetContext } from './sb-widget-context';
import { SbEventTopic } from 'src/services/sb-event-topic';

export interface SbMultiSelectContext extends SbWidgetContext {
  label?: string;
  filterPlaceHolder?: string;
  topic: SbEventTopic;
  source: string;
  allSelectedByDefault: boolean;
}
