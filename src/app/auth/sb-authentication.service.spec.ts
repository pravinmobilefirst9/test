/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SbAuthenticationService } from './sb-authentication.service';

describe('Service: SbAuthentication', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SbAuthenticationService]
    });
  });

  it('should ...', inject([SbAuthenticationService], (service: SbAuthenticationService) => {
    expect(service).toBeTruthy();
  }));
});
