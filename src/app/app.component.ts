import {
  Component,
  AfterViewInit,
  ElementRef,
  Renderer2,
  ViewChild,
  OnDestroy,
  OnInit,
  NgZone,
  HostBinding
} from '@angular/core';
import { ScrollPanel } from 'primeng/scrollpanel';
import { SbAuthenticationService } from 'src/app/auth/sb-authentication.service';
import { Router, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppConfig } from './config/app.config';
import { SbPropertiesService } from '../services/sb-properties.service';
import { registerLocaleData } from '@angular/common';
import se from '@angular/common/locales/se';
import { UserIdleService } from 'angular-user-idle';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { SbEventBusService } from '../services/sb-event-bus.service';
import { SbIdleOverlayComponent } from './sb-overlay/sb-idle-overlay.component';
import { SbConnectionOverlayComponent } from './sb-overlay/sb-connection-overlay.component';
import { SbEventTopic } from 'src/services/sb-event-topic';
import * as _moment from 'moment';
import { defaultFormat as _rollupMoment } from 'moment';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import{SbPrintService} from 'src/services/sb-print.service'

import { environment } from '../environments/environment'
import { OverlayContainer } from '@angular/cdk/overlay';
import { Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

const moment = _rollupMoment || _moment;

enum MenuOrientation {
  STATIC,
  OVERLAY,
  SLIM,
  HORIZONTAL
}

export const SB_DATE_FORMATS = {
  parse: {
    dateInput: 'YYYY-MM-DD',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
  display: {
    dateInput: 'YYYY-MM-DD',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },

    { provide: MAT_DATE_FORMATS, useValue: SB_DATE_FORMATS },
  ]
})
export class AppComponent implements AfterViewInit, OnDestroy, OnInit {

  public clientName: string = environment.client.clientName; // imported from environments.ts

  disconnected = false;

  layoutCompact = true;

  layoutMode: MenuOrientation = MenuOrientation.STATIC;

  darkMenu = false;

  profileMode = 'inline';

  rotateMenuButton: boolean;

  topbarMenuActive: boolean;

  overlayMenuActive: boolean;

  staticMenuDesktopInactive: boolean;

  staticMenuMobileActive: boolean;

  rightPanelActive: boolean;

  rightPanelClick: boolean;

  layoutContainer: HTMLDivElement;

  layoutMenuScroller: HTMLDivElement;

  menuClick: boolean;

  topbarItemClick: boolean;

  activeTopbarItem: any;

  resetMenu: boolean;

  menuHoverActive: boolean;

  @ViewChild('layoutContainer') layourContainerViewChild: ElementRef;

  @ViewChild('scrollPanel') layoutMenuScrollerViewChild: ScrollPanel;

  rippleInitListener: any;

  rippleMouseDownListener: any;

  subscription: Subscription;

  public printLayout:boolean;

  constructor(
    public overlayContainer: OverlayContainer,
    public renderer2: Renderer2,
    public zone: NgZone,
    public authService: SbAuthenticationService,
    private renderer: Renderer2,
    private router: Router,
    private appConfig: AppConfig,
    private propertiesService: SbPropertiesService,
    private httpClient: HttpClient,
    private eventService: SbEventBusService,
    @Inject(DOCUMENT) private _document: HTMLDocument,
    private printService:SbPrintService
  ) {

    this.setupPingService(httpClient, appConfig);

    this.hideOverlayMenu();
  }

  @HostBinding('class') componentCssClass;

  private setupPingService(httpClient: HttpClient, appConfig: AppConfig) {
    const MAX_FAILED_COUNT = 2;
    let failedCount = 0;

    const ping = () => {
      if (appConfig.gatewayBaseUrl != null) {

        httpClient.get(`${appConfig.gatewayBaseUrl}/alive/ping`).subscribe(
          next => {
            this.disconnected = false;
            failedCount = 0;
          },
          error => {
            failedCount += 1;
            if (failedCount > MAX_FAILED_COUNT) {
              this.disconnected = true;
            }
          });
        setTimeout(ping, 10000);
      } else {
        setTimeout(ping, 2000);
      }
    };
    ping();
  }

  ngOnInit() {

    // Setting
    const themeClass = this.appConfig.theme.cssTheme ? this.appConfig.theme.cssTheme : 'light-theme';
    const appTitle = this.appConfig.theme.appTitle ? this.appConfig.theme.appTitle : 'Swimbird Portfolio Platform';
    this._document.title = appTitle;
    this.overlayContainer.getContainerElement().classList.add(themeClass);
    this.componentCssClass = themeClass;

    this.printService.IsPrinting.subscribe(isprinting=>{
      this.printLayout = isprinting;
    })
    registerLocaleData(se);
    this.zone.runOutsideAngular(() => {
      this.bindRipple();
    });
  }

  bindRipple() {
    this.rippleInitListener = this.init.bind(this);
    document.addEventListener('DOMContentLoaded', this.rippleInitListener);
  }

  init() {
    this.rippleMouseDownListener = this.rippleMouseDown.bind(this);
    document.addEventListener('mousedown', this.rippleMouseDownListener, false);
  }

  rippleMouseDown(e) {
    for (
      let target = e.target;
      target && target !== this;
      target = target['parentNode']
    ) {
      if (!this.isVisible(target)) {
        continue;
      }

      // Element.matches() -> https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
      if (this.selectorMatches(target, '.ripplelink, .ui-button')) {
        const element = target;
        this.rippleEffect(element, e);
        break;
      }
    }
  }

  selectorMatches(el, selector) {
    const p = Element.prototype;
    const f =
      p['matches'] ||
      p['webkitMatchesSelector'] ||
      p['mozMatchesSelector'] ||
      p['msMatchesSelector'] ||
      function (s) {
        return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
      };
    return f.call(el, selector);
  }

  isVisible(el) {
    return !!(el.offsetWidth || el.offsetHeight);
  }

  rippleEffect(element, e) {
    if (element.querySelector('.ink') === null) {
      const inkEl = document.createElement('span');
      this.addClass(inkEl, 'ink');

      if (
        this.hasClass(element, 'ripplelink') &&
        element.querySelector('span')
      ) {
        element
          .querySelector('span')
          .insertAdjacentHTML('afterend', '<span class=\'ink\'></span>');
      } else {
        element.appendChild(inkEl);
      }
    }

    const ink = element.querySelector('.ink');
    this.removeClass(ink, 'ripple-animate');

    if (!ink.offsetHeight && !ink.offsetWidth) {
      const d = Math.max(element.offsetWidth, element.offsetHeight);
      ink.style.height = d + 'px';
      ink.style.width = d + 'px';
    }

    const x = e.pageX - this.getOffset(element).left - ink.offsetWidth / 2;
    const y = e.pageY - this.getOffset(element).top - ink.offsetHeight / 2;

    ink.style.top = y + 'px';
    ink.style.left = x + 'px';
    ink.style.pointerEvents = 'none';
    this.addClass(ink, 'ripple-animate');
  }
  hasClass(element, className) {
    if (element.classList) {
      return element.classList.contains(className);
    } else {
      return new RegExp('(^| )' + className + '( |$)', 'gi').test(
        element.className
      );
    }
  }

  addClass(element, className) {
    if (element.classList) {
      element.classList.add(className);
    } else {
      element.className += ' ' + className;
    }
  }

  removeClass(element, className) {
    if (element.classList) {
      element.classList.remove(className);
    } else {
      element.className = element.className.replace(
        new RegExp(
          '(^|\\b)' + className.split(' ').join('|') + '(\\b|$)',
          'gi'
        ),
        ' '
      );
    }
  }

  getOffset(el) {
    const rect = el.getBoundingClientRect();

    return {
      top:
        rect.top +
        (window.pageYOffset ||
          document.documentElement.scrollTop ||
          document.body.scrollTop ||
          0),
      left:
        rect.left +
        (window.pageXOffset ||
          document.documentElement.scrollLeft ||
          document.body.scrollLeft ||
          0)
    };
  }

  unbindRipple() {
    if (this.rippleInitListener) {
      document.removeEventListener('DOMContentLoaded', this.rippleInitListener);
    }
    if (this.rippleMouseDownListener) {
      document.removeEventListener('mousedown', this.rippleMouseDownListener);
    }
  }

  ngAfterViewInit() {
    this.layoutContainer = <HTMLDivElement>(
      (this.layoutMenuScrollerViewChild &&
        this.layourContainerViewChild.nativeElement)
    );
    if (this.layoutMenuScrollerViewChild) {
      setTimeout(() => {
        this.layoutMenuScrollerViewChild.moveBar();
      }, 100);
    }
  }

  onLayoutClick() {
    if (!this.topbarItemClick) {
      this.activeTopbarItem = null;
      this.topbarMenuActive = false;
    }

    if (!this.menuClick) {
      if (this.isHorizontal() || this.isSlim()) {
        this.resetMenu = true;
      }

      if (this.overlayMenuActive || this.staticMenuMobileActive) {
        this.hideOverlayMenu();
      }

      this.menuHoverActive = false;
    }

    if (!this.rightPanelClick) {
      this.rightPanelActive = false;
    }

    this.topbarItemClick = false;
    this.menuClick = false;
    this.rightPanelClick = false;
  }

  onMenuButtonClick(event) {
    this.menuClick = true;
    this.rotateMenuButton = !this.rotateMenuButton;
    this.topbarMenuActive = false;

    if (this.layoutMode === MenuOrientation.OVERLAY) {
      this.overlayMenuActive = !this.overlayMenuActive;
    } else {
      if (this.isDesktop()) {
        this.staticMenuDesktopInactive = !this.staticMenuDesktopInactive;
      } else {
        this.staticMenuMobileActive = !this.staticMenuMobileActive;
      }
    }

    event.preventDefault();
  }

  onMenuClick($event) {
    this.menuClick = true;
    this.resetMenu = false;
  }

  onTopbarMenuButtonClick(event) {
    this.topbarItemClick = true;
    this.topbarMenuActive = !this.topbarMenuActive;

    this.hideOverlayMenu();

    event.preventDefault();
  }

  onTopbarItemClick(event, item) {
    this.topbarItemClick = true;

    if (this.activeTopbarItem === item) {
      this.activeTopbarItem = null;
    } else {
      this.activeTopbarItem = item;
    }

    event.preventDefault();
  }

  onTopbarSubItemClick(event) {
    event.preventDefault();
  }

  onRightPanelButtonClick(event) {
    this.rightPanelClick = true;
    this.rightPanelActive = !this.rightPanelActive;
    event.preventDefault();
  }

  onRightPanelClick() {
    this.rightPanelClick = true;
  }

  hideOverlayMenu() {
    this.rotateMenuButton = false;
    this.overlayMenuActive = false;
    this.staticMenuMobileActive = false;
    this.staticMenuDesktopInactive = false;
  }

  isTablet() {
    const width = window.innerWidth;
    return width <= 1024 && width > 640;
  }

  isDesktop() {
    return window.innerWidth > 1024;
  }

  isMobile() {
    return window.innerWidth <= 640;
  }

  isOverlay() {
    return this.layoutMode === MenuOrientation.OVERLAY;
  }

  isHorizontal() {
    return this.layoutMode === MenuOrientation.HORIZONTAL;
  }

  isSlim() {
    return this.layoutMode === MenuOrientation.SLIM;
  }

  changeToStaticMenu() {
    this.layoutMode = MenuOrientation.STATIC;
  }

  changeToOverlayMenu() {
    this.layoutMode = MenuOrientation.OVERLAY;
  }

  changeToHorizontalMenu() {
    this.layoutMode = MenuOrientation.HORIZONTAL;
  }

  changeToSlimMenu() {
    this.layoutMode = MenuOrientation.SLIM;
  }

  ngOnDestroy() {
    this.unbindRipple();
  }

  onToggeling(id) {
    id.toggle();
  }
}
