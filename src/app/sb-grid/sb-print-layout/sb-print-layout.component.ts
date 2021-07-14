import { Component, OnInit, Input, HostListener } from '@angular/core';
import { NavigationEnd } from '@angular/router';
import { SbLayout } from 'src/model/sb-layout';
import { SbEventBusService } from 'src/services/sb-event-bus.service';
import { SbEvent } from 'src/services/sb-event';
import { SbEventTopic } from 'src/services/sb-event-topic';
import { PanelLayout } from '.././../../model/panel-layout';
import { SbPrintService } from '../../../services/sb-print.service'
import { Router } from '@angular/router';

@Component({
  selector: 'app-sb-print-layout',
  templateUrl: './sb-print-layout.component.html',
  styleUrls: ['./sb-print-layout.component.scss']
})
export class SbPrintLayoutComponent implements OnInit {

  @Input() panelId: string;
  @Input() grid: any;
  public FormattedPrintFormData: string;
  printLayout: boolean;
  constructor(private eventBus: SbEventBusService,
    private printService: SbPrintService,
    private router: Router,
  ) { 
    router.events.subscribe(val=>{
      if(!(val instanceof NavigationEnd)){
        this.printService.changePrintStatus(false);
        this.printService.checkPrintingEnables(false);
      }
    })
  }

  btnPrint(event: any) {
    const payload: SbEvent = {
      source: this.panelId,
      topic: SbEventTopic.Print,
      payload: 'Printing'
    };
    this.eventBus.emit(payload);
    setTimeout(() => {
      print();
    }, 1500);
  }

  @HostListener('window:afterprint', ['$event'])

  onAfterPrint(event) {
    this.donePrinting();
  }

  donePrinting() {
    this.printService.IsPrinting.subscribe(isprinting=>{
      this.printLayout = isprinting;
    })
    const payload: SbEvent = {
      source: this.panelId,
      topic: SbEventTopic.Print,
      payload: 'PrintingDone'
    };
    this.eventBus.emit(payload);
  }

  ngOnInit() { 
    this.printService.PrintFormData.subscribe(formData=>{
      this.FormattedPrintFormData = formData;
    })
  }

  ngOnDestroy() {
    this.cancelPrintPreview();
  }

  cancelPrintPreview() {
    this.printService.changePrintStatus(false);
    const payload: SbEvent = {
      source: this.panelId,
      topic: SbEventTopic.Print,
      payload: 'notPrint'
    };
    this.eventBus.emit(payload);
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
