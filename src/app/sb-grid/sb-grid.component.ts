import { PanelLayout } from './../../model/panel-layout';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewEncapsulation,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SbGridService } from 'src/services/sb-grid.service';
import { Subscription } from 'rxjs';
import { SbGrid } from 'src/model/sb-grid';
import { SbLayout } from 'src/model/sb-layout';
import { SbEventBusService } from 'src/services/sb-event-bus.service';
import { SbEvent } from 'src/services/sb-event';
import { SbEventTopic } from 'src/services/sb-event-topic';
import{SbPrintService} from 'src/services/sb-print.service'

@Component({
  selector: 'app-sb-grid',
  templateUrl: './sb-grid.component.html',
  styleUrls: ['./sb-grid.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SbGridComponent implements OnInit, OnDestroy {
  gridPath: string;
  grid: SbGrid;
  isDataLoaded = false;
  private sub: Subscription;
  public printLayout:boolean;
  IsEnabledPrinting: boolean;
  constructor(
    private route: ActivatedRoute,
    private gridService: SbGridService,
    private eventBus: SbEventBusService,
    private changeDetector: ChangeDetectorRef,
    private printService:SbPrintService
  ) { }

  ngOnInit() {
    this.printService.IsPrinting.subscribe(isprinting=>{
      this.printLayout = isprinting;
    })
    this.printService.IsEnabledPrinting.subscribe(isEnablePrint=>{
      this.IsEnabledPrinting = isEnablePrint;
    })

    this.sub = this.route.params.subscribe(params => {
      // this.route.pathFromRoot;
      this.gridPath = params['gridPath'];

      this.gridService.getGrid(this.gridPath).then(
        g => {
          this.grid = g;
          this.isDataLoaded = true;
          this.changeDetector.markForCheck();
        },
        err => {
          console.error(
            'Could not load grid with path: ' +
            this.gridPath +
            ' due to: ' +
            err
          );
          // Todo - redirect to login page? This just means showing a blank screen.
          this.isDataLoaded = true;
        }
      );
    });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  // Todo - extract to utility method - being used here and in panel-component.ts DRY
  getLayoutClass(sbLayout: SbLayout): string {
    const width = `p-col-${sbLayout.width || 12}`;
    if (sbLayout.width) {
      return width;
    } else {
      const widthSm = `p-sm-${sbLayout.widthSm || 12}`;
      const widthMd = `p-md-${sbLayout.widthMd || 6}`;
      const widthLg = `p-lg-${sbLayout.widthLg || 4}`;
      const widthXl = `p-xl-${sbLayout.widthXl || 4}`;
      const fixedAt = sbLayout.fixAtSm ? 'sb-p-col-fixed-small'
        : sbLayout.fixedAtMd ? 'sb-p-col-fixed-medium'
          : sbLayout.fixedAtLg ? 'sb-p-col-fixed-large'
            : sbLayout.fixedAtXl ? 'sb-p-col-fixed-huge'
              : sbLayout.fixedAtLandscapePrint ? 'sb-p-col-landscape-print'
                : sbLayout.fixedAtPortraitPrint ? 'sb-p-col-portrait-print'
                  : '';
      return ['p-col-12', widthSm, widthMd, widthLg, widthXl, fixedAt].join(' ');
    }
  }

  hasPanelLayouts(panelLayout: PanelLayout): boolean {
    return (
      panelLayout.panelLayouts != null && panelLayout.panelLayouts.length > 0
    );
  }
  hasTabbedPanels(panelLayout: PanelLayout): boolean {
    return (
      panelLayout.tabbedPanels != null && panelLayout.tabbedPanels.length > 0
    );
  }

  handleTabChange(e) {
    const event: SbEvent = {
      source: 'DoIneedThisInThisCase',
      topic: SbEventTopic.TabPanelTabChange,
      payload: {
        tabIndex: e.index
      }
    };
    this.eventBus.emit(event);
  }
}
