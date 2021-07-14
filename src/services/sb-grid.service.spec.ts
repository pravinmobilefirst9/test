import { TestBed } from '@angular/core/testing';

import { SbGridService } from './sb-grid.service';

describe('SbGridService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SbGridService = TestBed.get(SbGridService);
    expect(service).toBeTruthy();
  });
});
