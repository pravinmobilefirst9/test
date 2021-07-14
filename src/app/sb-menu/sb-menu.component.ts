import { Component, ViewChild, Renderer2 } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subscription } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { MatSidenav } from '@angular/material/sidenav';
import { MatAccordion } from '@angular/material/expansion';
import { SbEventTopic } from 'src/services/sb-event-topic';
import { AppConfig } from '../config/app.config';
import { SbEventBusService } from '../../services/sb-event-bus.service';
import { SbAuthenticationService } from '../auth/sb-authentication.service';
import { HttpClient } from '@angular/common/http';
import { UserInfo } from '../auth/user-info';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SbMenuService } from 'src/services/sb-menu.service';
import { MenuItem } from 'primeng/primeng';
import { SbLogoutConfirmDialogComponent } from '../sb-logout-confirm-dialog/sb-logout-confirm-dialog.component';

@Component({
  selector: 'sb-menu',
  templateUrl: './sb-menu.component.html',
  styleUrls: ['./sb-menu.component.css']
})
export class SbMenuComponent {
  @ViewChild(MatSidenav) sideNavContainer: MatSidenav;
  @ViewChild(MatAccordion) accordion: MatAccordion;
  activeItem: string;
  activeListItem: string;
  activeSubListItem: string;
  isVisible: boolean;
  setPos: boolean;

  // router: any;
  baseCurrency: String = '';
  currenciesAndRates: CurrencyAndRate[];
  userDetails: string;
  userName: string;
  userRoles: string[];
  observable: Observable<UserInfo>;
  subscription: Subscription;
  model: MenuItem[];
  version: String;

  constructor(private breakpointObserver: BreakpointObserver,
    private appConfig: AppConfig,
    private authentication: SbAuthenticationService,
    private http: HttpClient,
    private eventBusService: SbEventBusService,
    private router: Router,
    private ren: Renderer2,
    public dialog: MatDialog,
    private menuService: SbMenuService,
  ) {
    this.baseCurrency = appConfig.defaultBaseCurrency;

    this.eventBusService.getObservable(SbEventTopic.BaseCurrencySelected).subscribe(
      event => {
        if (event != null && event.source === 'base-currency-selection') {
          this.baseCurrency = event.payload.value;
        }
      },
      error => console.log(error)
    );

  }

  ngOnInit() {
    this.isVisible = true;
    this.menuService.getMenuConfiguration()
      .then(mis => { this.model = mis; })
      .catch(e => console.log('Could not load menu'));
  }

  menuButtonover(child) {
    for (let i = 0; i < child.length; i++) {
      if (child[i].items)
        this.setPos = false;
      else
        this.setPos = true;
    }
  }

  showMegaMenu() {
    this.isVisible = false;
    setTimeout(function () {
      this.isVisible = true;
    }.bind(this), 0);
  }

  setActiveItem(page: string) {
    this.activeItem = page;
    this.showMegaMenu();
  }

  setActiveListItem(page: string, parentPage: string) {
    this.activeListItem = page;
    this.activeItem = parentPage;
    this.activeSubListItem = '';
    this.showMegaMenu();
  }

  setSubActiveListItem(page: string, parentPage: string, topParentPage: string) {
    this.activeSubListItem = page;
    this.activeListItem = parentPage;
    this.activeItem = topParentPage;
    this.showMegaMenu();
  }

  setExpanded(page: string) {
    if (this.activeItem == page) {
      return true;
    }
    return false;
  }

  onLogout() {
    this.dialog.open(SbLogoutConfirmDialogComponent, {
      height: '175px',
      width: '250px',
    });
  }

  ngAfterViewInit(): void {
    if (this.authentication.isAuthenticated()) {
      setTimeout(() => {
        this.version = this.appConfig.buildVersion;
        this.observable = this.authentication.userInfoSubject;
        this.subscription = this.observable.subscribe(userInfo => {
          this.userDetails = userInfo.toString();
          this.userName = userInfo.username;
          this.userRoles = userInfo.uglyfyRoles();
        });
        this.fetchCurrencies(this.baseCurrency);
      });
    }

  }

  fetchCurrencies(baseCurrency: String) {
    const headers = this.authentication.getHeaderWithToken();
    this.http.get(this.appConfig.gatewayBaseUrl + '/currencies-and-rates', {
      headers: headers, params: {'baseCurrency': `${baseCurrency}`}})
        .toPromise().then(response => {
      this.currenciesAndRates = response['currenciesAndRates'];
    });
  }

  onCurrencySelected(currency: string) {
    this.eventBusService.emit({
      source: 'base-currency-selection',
      topic: SbEventTopic.BaseCurrencySelected,
      payload: {
        value: currency
      }
    });
    this.fetchCurrencies(currency);
  }

  toggleSideNav() {
    this.sideNavContainer.toggle();
  }

  openMenu(menuLink: string) {
    if (menuLink != undefined) {
      this.router.navigate([menuLink]);
    }
  }

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  menuenter() {
    this.isMatMenuOpen = true;
    if (this.isMatMenu2Open) {
      this.isMatMenu2Open = false;
    }
  }

  menuLeave(trigger, button) {
    setTimeout(() => {
      if (!this.isMatMenu2Open && !this.enteredButton) {
        this.isMatMenuOpen = false;
        trigger.closeMenu();
        this.ren.removeClass(button['_elementRef'].nativeElement, 'cdk-focused');
        this.ren.removeClass(button['_elementRef'].nativeElement, 'cdk-program-focused');
      } else {
        this.isMatMenuOpen = false;
      }
    }, 80)
  }

  menu2enter() {
    this.isMatMenu2Open = true;
  }

  menu2Leave(trigger1, trigger2, button) {
    setTimeout(() => {
      if (this.isMatMenu2Open) {
        trigger1.closeMenu();
        this.isMatMenuOpen = false;
        this.isMatMenu2Open = false;
        this.enteredButton = false;
        this.ren.removeClass(button['_elementRef'].nativeElement, 'cdk-focused');
        this.ren.removeClass(button['_elementRef'].nativeElement, 'cdk-program-focused');
      } else {
        this.isMatMenu2Open = false;
        trigger2.closeMenu();
      }
    }, 100)
  }

  buttonEnter(trigger) {
    setTimeout(() => {
      if (this.prevButtonTrigger && this.prevButtonTrigger != trigger) {
        this.prevButtonTrigger.closeMenu();
        this.prevButtonTrigger = trigger;
        this.isMatMenuOpen = false;
        this.isMatMenu2Open = false;
        trigger.openMenu();
        this.ren.removeClass(trigger.menu.items.first['_elementRef'].nativeElement, 'cdk-focused');
        this.ren.removeClass(trigger.menu.items.first['_elementRef'].nativeElement, 'cdk-program-focused');
      }
      else if (!this.isMatMenuOpen) {
        this.enteredButton = true;
        this.prevButtonTrigger = trigger
        trigger.openMenu();
        this.ren.removeClass(trigger.menu.items.first['_elementRef'].nativeElement, 'cdk-focused');
        this.ren.removeClass(trigger.menu.items.first['_elementRef'].nativeElement, 'cdk-program-focused');
      }
      else {
        this.enteredButton = true;
        this.prevButtonTrigger = trigger
      }
    })
  }

  buttonLeave(trigger, button) {
    setTimeout(() => {
      if (this.enteredButton && !this.isMatMenuOpen) {
        trigger.closeMenu();
        this.ren.removeClass(button['_elementRef'].nativeElement, 'cdk-focused');
        this.ren.removeClass(button['_elementRef'].nativeElement, 'cdk-program-focused');
      } if (!this.isMatMenuOpen) {
        trigger.closeMenu();
        this.ren.removeClass(button['_elementRef'].nativeElement, 'cdk-focused');
        this.ren.removeClass(button['_elementRef'].nativeElement, 'cdk-program-focused');
      } else {
        this.enteredButton = false;
      }
    }, 100)
  }

  navigateToDashboard() {
    this.router.navigate(['/']);
    this.activeListItem = '/';
    this.activeItem = '/';
    this.activeSubListItem = '/';
  }

  enteredButton = false;
  isMatMenuOpen = false;
  isMatMenu2Open = false;
  prevButtonTrigger;
}

export class CurrencyAndRate {
  currency: string;
  basePriceRate: number;

  constructor(currency: string, basePriceRate: number) {
    this.currency = currency;
    this.basePriceRate = basePriceRate;
  }
}
