import { TestBed } from '@angular/core/testing';

import { SbMenuService } from './sb-menu.service';

describe('SbMenuService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SbMenuService = TestBed.get(SbMenuService);
    expect(service).toBeTruthy();
  });
});
