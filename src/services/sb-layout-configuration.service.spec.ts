import { TestBed } from '@angular/core/testing';

import { SbLayoutConfigurationService } from './sb-layout-configuration.service';

describe('SbLayoutConfigurationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SbLayoutConfigurationService = TestBed.get(SbLayoutConfigurationService);
    expect(service).toBeTruthy();
  });
});
