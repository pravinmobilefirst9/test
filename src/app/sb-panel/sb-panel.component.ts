import { first } from 'rxjs/operators';
import { SbFormContextService } from 'src/services/sb-form-context.service';
import { environment } from './../../environments/environment';
import { SbLayout } from './../../model/sb-layout';
import { SbPanel } from 'src/model/sb-panel';
import { SbPanelService } from 'src/services/sb-panel.service';
import { SbWidgetDirective } from '../sb-widget.directive';
import { SbWidgetService } from 'src/services/sb-widget.service';
import {SbPrintService} from 'src/services/sb-print.service'
import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ViewChild,
  ComponentFactoryResolver,
  ViewEncapsulation,
  Renderer2,
  ViewContainerRef,
  ComponentRef,
  HostListener
} from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { SbWidgetLayout } from 'src/model/sb-widget-layout';
import { SbWidgetType } from 'src/model/sb-widget-type.enum';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { SbEvent } from 'src/services/sb-event';
import { SbEventTopic } from 'src/services/sb-event-topic';
import { SbEventBusService } from 'src/services/sb-event-bus.service';
@Component({
  selector: 'app-sb-panel',
  templateUrl: './sb-panel.component.html',
  styleUrls: ['./sb-panel.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SbPanelComponent implements OnInit, OnDestroy {
  @Input() panelId: string;
  @Input() tabId: number;
  @ViewChild(SbWidgetDirective, { static: true }) sbPanel: SbWidgetDirective;
  title: string;
  divider: boolean;
  hidePanelHeader: boolean;
  collapse: boolean;
  disableCollapseBelowBreakpoint: boolean;
  enableToggling: boolean;
  widgetLayouts: SbWidgetLayout[];
  isStandaloneForm: boolean;
  subscriptions: Subscription[] = [];
  enablePrinting: boolean;
  printLayout:boolean = false;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private sbPanelService: SbPanelService,
    private sbWidgetService: SbWidgetService,
    private formContextService: SbFormContextService,
    private breakpointObserver: BreakpointObserver,
    private _renderer: Renderer2,
    private route: ActivatedRoute,
    private location: Location,
    private eventBus: SbEventBusService,
    private printService : SbPrintService
  ) { }

  ngOnInit() {
    this.loadComponent();
    this.printService.IsPrinting.subscribe(isprinting=>{
      this.printLayout = isprinting;
    })    
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => {
      if (s) {
        s.unsubscribe();
      }
    });
  }

  loadComponent() {
    if (this.panelId) {
      this.sbPanelService.getAPanel(this.panelId).then(
        p => {
          this.renderPanel(p);
          this.registerBreakPointSubscriber();
        },
        err => {
          console.error(
            'Could not load panel with ID: ' + this.panelId + '. Reason: ' + err
          );
        }
      );
    } else {
      console.error('No panelId provided, could not render panel.');
    }
  }

  private registerBreakPointSubscriber() {
    const sub = this.breakpointObserver
      .observe([`(max-width: ${environment.mobileScreenBreakpoint})`])
      .subscribe(result => {
        this.enableToggling =
          result.matches && !this.disableCollapseBelowBreakpoint;
        this.collapse = result.matches && !this.disableCollapseBelowBreakpoint;
      });
    this.subscriptions.push(sub);
  }
  getDividerStyle() {
    if (this.divider === false) {
      return {
        'border-bottom': 'none'
      };
    }
  }

  getDividerClass(): string {
    if (this.divider === false) {
      return 'sb-panel-no-divider';
    }
  }

  getHeaderClass(): string {
    if (this.hidePanelHeader) {
      return 'sb-panel-no-header';
    }
  }

  getPanelClasses(): string {
    const classes: string[] = [this.getDividerClass(), this.getHeaderClass()];
    return classes.filter(c => c).join(' ');
  }

  async renderPanel(sbPanel: SbPanel) {
    // Get a list of widgets from sbPanel
    this.title = sbPanel.headerText;
    this.divider = sbPanel.divider;
    this.enablePrinting = sbPanel.enablePrinting;
    (this.enablePrinting) && this.printService.checkPrintingEnables(true);
    const isInTabbedView = (this.tabId ? true : this.tabId === 0 ? true : false);
    this.hidePanelHeader = sbPanel.hidePanelHeader || isInTabbedView;
    this.isStandaloneForm = sbPanel.isStandaloneForm;
    this.disableCollapseBelowBreakpoint =
      sbPanel.disableCollapseBelowBreakpoint || sbPanel.isStandaloneForm || isInTabbedView;
    this.widgetLayouts = sbPanel.widgetLayouts ? sbPanel.widgetLayouts : [];

    this.addWidgetsFromPanelContext(sbPanel);
  }

  async addWidgetsFromPanelContext(sbPanel: SbPanel) {
    const viewContainerRef = this.sbPanel.viewContainerRef;
    viewContainerRef.clear();

    const widgetIds = this.widgetIdsFromContext(sbPanel);
    const id = this.route.snapshot.paramMap.get('id');
    const widgets = widgetIds.map(wId => this.resolveWidgetComponent(wId, id, viewContainerRef));
    const widgetComponents = await Promise.all(widgets);
    widgetComponents.forEach(wc =>
      this.createAndAddWidget(viewContainerRef, wc, wc.instance.context.widgetId, sbPanel));
  }

  async resolveWidgetComponent(widgetId: string, id: string, viewContainerRef: ViewContainerRef): Promise<ComponentRef<any>> {
    const widgetDefinition = await this.sbWidgetService.resolveWidget(
      widgetId
    );
    const widgetContext = widgetDefinition.widgetType === SbWidgetType.FormWidget ?
      await this.formContextService.getFormConfig(widgetId, id).pipe(first()).toPromise()
      : await this.sbWidgetService.resolveContext(widgetId);

    const resolvedComponent = this.sbPanelService.resolveComponent(
      widgetDefinition.widgetType
    );
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
      resolvedComponent
    );
    const componentRef = viewContainerRef.createComponent(
      componentFactory,
      0
    );
    componentRef.instance.context = widgetContext;
    return componentRef;
  }
  widgetIdsFromContext(sbPanel: SbPanel): string[] {
    return sbPanel.widgetLayouts && sbPanel.widgetLayouts.length > 0
      ? sbPanel.widgetLayouts.map(lo => lo.widgetId)
      : sbPanel.widgetIds;
  }
  createAndAddWidget(viewContainerRef: ViewContainerRef, componentRef: ComponentRef<any>, widgetId: string, sbPanel: SbPanel): any {
    const _el = componentRef.location;
    const parent = _el.nativeElement.parentNode;
    // This statement has to be exactly here
    viewContainerRef.insert(componentRef.hostView);

    // 1. Skapa div
    const divElement = this._renderer.createElement('div');

    // Add widget header if set in widget context
    if (componentRef.instance.context.hasOwnProperty('headerText')
      && componentRef.instance.context.headerText) {
      const headerTextFromContext = componentRef.instance.context.headerText;
      const widgetHeader = this._renderer.createElement('div');
      const widgetText = this._renderer.createElement('span');

      this._renderer.addClass(widgetHeader, 'sb-widget-header');
      const widgetHeaderText = this._renderer.createText(headerTextFromContext);
      this._renderer.appendChild(widgetText, widgetHeaderText);

      const widgetHeaderInfo = this._renderer.createElement('span');
      this._renderer.addClass(widgetHeaderInfo, 'sb-header-info');


      this._renderer.appendChild(widgetHeader, widgetText);
      this._renderer.appendChild(widgetHeader, widgetHeaderInfo);
      this._renderer.appendChild(divElement, widgetHeader);
      // Only register header info subscriber if widget header is explicitly set.
      const sub = componentRef.instance.headerInfo.subscribe(hi =>
        this.widgetHeaderInfoUpdated(hi, widgetHeaderInfo));
      this.subscriptions.push(sub);
    }

    // Todo - create widget component- move template code there instead.
    const classes = this.getLayoutClassFromWidgetId(
      widgetId,
      sbPanel.widgetLayouts
    );
    classes.forEach(c => {
      this._renderer.addClass(divElement, c);
    });

    // 2. Lägg in widget i diven
    this._renderer.appendChild(divElement, _el.nativeElement);
    this._renderer.appendChild(parent, divElement);
  }

  widgetHeaderInfoUpdated(headerInfo: string, widgetHeaderInfo: any) {

    if (widgetHeaderInfo.innerText) {
      widgetHeaderInfo.innerText = headerInfo;
    } else {
      const widgetHeaderInfoText = this._renderer.createText(headerInfo);
      this._renderer.appendChild(widgetHeaderInfo, widgetHeaderInfoText);
    }
  }

  getLayoutClassFromWidgetId(
    widgetId: string,
    widgetLayouts?: SbWidgetLayout[]
  ): string[] {
    if (widgetLayouts) {
      const sbLayout = widgetLayouts.find(lo => lo.widgetId === widgetId);
      return this.getLayoutClass(sbLayout);
    }
    return this.getLayoutClass();
  }

  // Todo - extract to utility method - being used here and in grid-component.ts DRY
  getLayoutClass(sbLayout?: SbLayout): string[] {
    if (!sbLayout) {
      return ['p-col-12'];
    }
    if (sbLayout.width) {
      const width = `p-col-${sbLayout.width || 12}`;
      return [width];
    } else {
      const widthSm = `p-sm-${sbLayout.widthSm || 12}`;
      const widthMd = `p-md-${sbLayout.widthMd || 6}`;
      const widthLg = `p-lg-${sbLayout.widthLg || 4}`;
      const widthXl = `p-xl-${sbLayout.widthXl || 4}`;
      return ['p-col-12', widthSm, widthMd, widthLg, widthXl];
    }
  }

  formCancel(event) {
    this.location.back();
  }

  btnPrint(event: any) {
    this.printService.changePrintStatus(true);
    const payload: SbEvent = {
      source: this.panelId,
      topic: SbEventTopic.Print,
      payload: 'print-preview'
    };
    this.eventBus.emit(payload);
  }

  @HostListener('window:afterprint', ['$event'])
  onAfterPrint(event) {
    this.donePrinting();
  }
  donePrinting() {
    const payload: SbEvent = {
      source: this.panelId,
      topic: SbEventTopic.Print,
      payload: 'PrintingDone'
    };
    this.eventBus.emit(payload);
  }
}
