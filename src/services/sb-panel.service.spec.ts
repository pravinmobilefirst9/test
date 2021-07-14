import { TestBed } from '@angular/core/testing';

import { SbPanelService } from './sb-panel.service';

describe('SbPanelService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SbPanelService = TestBed.get(SbPanelService);
    expect(service).toBeTruthy();
  });
});
