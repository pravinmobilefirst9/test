import { TestBed } from '@angular/core/testing';

import { SbFormContextService } from './sb-form-context.service';

describe('SbFormContextService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SbFormContextService = TestBed.get(SbFormContextService);
    expect(service).toBeTruthy();
  });
});
