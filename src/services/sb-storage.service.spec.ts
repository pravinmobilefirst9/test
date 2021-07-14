import { TestBed } from '@angular/core/testing';

import { SbStorageService } from './sb-storage.service';

describe('SbStorageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SbStorageService = TestBed.get(SbStorageService);
    expect(service).toBeTruthy();
  });
});
