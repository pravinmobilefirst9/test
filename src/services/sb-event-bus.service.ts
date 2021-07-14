import { Injectable } from '@angular/core';
import { SbEvent } from './sb-event';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs';
import { SbEventTopic } from './sb-event-topic';
import { SbEventListener } from 'src/model/sb-event-listener';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

// Todo - implement several subject types depending on use case: http://reactivex.io/documentation/subject.html
export class SbEventBusService {

  constructor() { }

  private eventsByTopic = new Map<String, BehaviorSubject<SbEvent>>();

  public hasStateStored(topic: String) {
    return this.eventsByTopic.has(topic) && this.eventsByTopic.get(topic).value;
  }

  public getLastEvent(topic: String): SbEvent {
    const subject = this.eventsByTopic.get(topic);
    if (subject) {
      return (<BehaviorSubject<SbEvent>>subject).value;
    }
    // Throw exception? We require call to hasStateStored before calling this.
    return null;
  }

  public getObservable(topic: String): Observable<SbEvent> {

    const eventsSubject = this.eventsByTopic.get(topic);
    if (eventsSubject) {
      return eventsSubject.asObservable();
    } else {
      this.eventsByTopic.set(
        topic,
        new BehaviorSubject<SbEvent>(null)
      );
      return this.eventsByTopic.get(topic).asObservable();
    }
  }

  public getAggregatedResult(filterListeners: SbEventListener[]): any[] {
    const result = new Array;
    filterListeners.forEach(eventListener => {
      if (this.eventsByTopic.has(eventListener.topic) && eventListener.queryParameters) {
        const payload = this.eventsByTopic.get(eventListener.topic).value || {
          payload: {
            value: eventListener.defaultValue
          }
        };
        result.push({
          eventListener,
          payload
        });
      }});
    return result;
  }

  public clear() {
    this.eventsByTopic.clear();
  }

  emit(event: SbEvent) {
    let subject = this.eventsByTopic.get(event.topic);
    if (!subject) {
      subject = new BehaviorSubject<SbEvent>({
        source: event.source,
        payload: event.payload
      });
      this.eventsByTopic.set(
        event.topic,
        subject
      );
    } else {
      subject.next(event);
    }
  }

  emitEmpty(source: string, topic: SbEventTopic) {
    if (this.hasStateStored(topic)) {
      this.eventsByTopic.get(topic).next(null);
    }
  }
}
