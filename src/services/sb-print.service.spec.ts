import { TestBed } from '@angular/core/testing';

import { SbPrintService } from './sb-print.service';

describe('SbPrintService', () => {
  let service: SbPrintService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SbPrintService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
