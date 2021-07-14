import { Component, OnDestroy } from '@angular/core';
import { AppComponent } from './app.component';
import { BreadcrumbService } from './breadcrumb.service';
import { Subscription } from 'rxjs';
import { MenuItem, ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';
import { SbEventBusService } from 'src/services/sb-event-bus.service';
import { SbEventTopic } from 'src/services/sb-event-topic';
import { AppConfig } from './config/app.config';

@Component({
    selector: 'app-breadcrumb',
    templateUrl: './app.breadcrumb.component.html'
})
export class AppBreadcrumbComponent implements OnDestroy {

    subscription: Subscription;
    baseCurrency: String = '';

    items: MenuItem[];

    constructor(private eventBus: SbEventBusService,
                private appConfig: AppConfig,
                private router: Router,
                public breadcrumbService: BreadcrumbService,
                public confirmationService: ConfirmationService) {
        this.subscription = breadcrumbService.itemsHandler.subscribe(response => {
            this.items = response;
        });

        this.baseCurrency = appConfig.defaultBaseCurrency;

        this.eventBus.getObservable(SbEventTopic.BaseCurrencySelected).subscribe(
          event => {
            if (event != null && event.source === 'base-currency-selection') {
              this.baseCurrency = event.payload.value;
            }
          },
          error => console.log(error)
        );
    }

    onLogout() {
      this.confirmationService.confirm({
        header: 'Logout',
        message: `Press Yes to confirm logout.`,
        icon: 'fa fa-question-circle',
        accept: () => {
          this.router.navigate(['logout']);
        }
      });
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
