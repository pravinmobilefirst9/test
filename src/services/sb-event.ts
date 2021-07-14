import { SbEventTopic } from './sb-event-topic';

export interface SbBaseEvent {
  source: string;
  topic?: SbEventTopic;
}

export interface SbEvent extends SbBaseEvent {
  payload: any;
}
