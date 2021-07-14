import { TestBed } from '@angular/core/testing';

import { SbCacheService } from './sb-cache.service';

describe('SbCacheService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SbCacheService = TestBed.get(SbCacheService);
    expect(service).toBeTruthy();
  });
});
