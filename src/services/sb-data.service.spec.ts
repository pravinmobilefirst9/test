import { TestBed } from '@angular/core/testing';

import { SbDataService } from './sb-data.service';

describe('SbDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SbDataService = TestBed.get(SbDataService);
    expect(service).toBeTruthy();
  });
});
