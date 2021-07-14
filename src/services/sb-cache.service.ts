import { SbMenuService } from './sb-menu.service';
import { SbPanelService } from 'src/services/sb-panel.service';
import { Injectable } from '@angular/core';
import { SbGridService } from './sb-grid.service';
import { SbWidgetService } from './sb-widget.service';
import { SbEventBusService } from './sb-event-bus.service';

@Injectable({
  providedIn: 'root'
})
export class SbCacheService {
  constructor(
    private sbGridService: SbGridService,
    private sbPanelService: SbPanelService,
    private sbWidgetService: SbWidgetService,
    private sbMenuService: SbMenuService,
    private sbEventBusService: SbEventBusService
  ) { }

  public invalidateCaches() {
    this.sbGridService.clear();
    this.sbPanelService.clear();
    this.sbWidgetService.clear();
    this.sbMenuService.clear();
    this.sbEventBusService.clear();
  }
}
