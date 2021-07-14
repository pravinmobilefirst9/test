/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SbWidgetService } from './sb-widget.service';

describe('Service: SbWidgetService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SbWidgetService]
        });
    });

    it('should ...', inject([SbWidgetService], (service: SbWidgetService) => {
        expect(service).toBeTruthy();
    }));
});
