/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SbEventBusService } from './sb-event-bus.service';

describe('Service: SbEventBus', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SbEventBusService]
    });
  });

  it('should ...', inject([SbEventBusService], (service: SbEventBusService) => {
    expect(service).toBeTruthy();
  }));
});
