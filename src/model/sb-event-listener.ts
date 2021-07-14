import { SbEventTopic } from 'src/services/sb-event-topic';
import { SbPath } from './sb-path';

export interface SbEventListener {
  source?: string;
  topic: SbEventTopic;
  sourceField?: string;
  targetField: string;
  resourceURL?: SbPath;
  queryParameters?: QueryParamConfig[];
  defaultValue?: any;
}

export interface QueryParamConfig {
  sourcePath: string;
  queryParamName: string;
  mandatory?: boolean;
  defaultValue?: any;
}
