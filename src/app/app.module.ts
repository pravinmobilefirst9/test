import { SbAuthenticationService } from './auth/sb-authentication.service';
import { TokenInterceptor } from './auth/token.interceptor';
import { SbGaugeComponent } from './widgets/sb-gauge/sb-gauge.component';
import { NgModule, APP_INITIALIZER, Injector, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient, HttpHeaders } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {
  LocationStrategy,
  HashLocationStrategy,
  PercentPipe
} from '@angular/common';
import { AppRoutes } from './app.routes';

import { AccordionModule } from 'primeng/accordion';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { CarouselModule } from 'primeng/carousel';
import { ChartModule } from 'primeng/chart';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipsModule } from 'primeng/chips';
import { CodeHighlighterModule } from 'primeng/codehighlighter';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DataViewModule } from 'primeng/dataview';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { EditorModule } from 'primeng/editor';
import { FieldsetModule } from 'primeng/fieldset';
import { FileUploadModule } from 'primeng/fileupload';
import { FullCalendarModule } from 'primeng/fullcalendar';
import { GalleriaModule } from 'primeng/galleria';
// import { GrowlModule } from 'primeng/api';
import { InplaceModule } from 'primeng/inplace';
import { InputMaskModule } from 'primeng/inputmask';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { LightboxModule } from 'primeng/lightbox';
import { ListboxModule } from 'primeng/listbox';
import { MegaMenuModule } from 'primeng/megamenu';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { ConfirmationService } from 'primeng/api';
import { KeyFilterModule } from 'primeng/keyfilter';
import { MultiSelectModule } from 'primeng/multiselect';
import { OrderListModule } from 'primeng/orderlist';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PaginatorModule } from 'primeng/paginator';
import { PanelModule } from 'primeng/panel';
import { PanelMenuModule } from 'primeng/panelmenu';
import { PasswordModule } from 'primeng/password';
import { PickListModule } from 'primeng/picklist';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SlideMenuModule } from 'primeng/slidemenu';
import { SliderModule } from 'primeng/slider';
import { SidebarModule } from 'primeng/sidebar';
import { SpinnerModule } from 'primeng/spinner';
import { SplitButtonModule } from 'primeng/splitbutton';
import { StepsModule } from 'primeng/steps';
import { TabMenuModule } from 'primeng/tabmenu';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TerminalModule } from 'primeng/terminal';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { ToastModule } from 'primeng/toast';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { TreeModule } from 'primeng/tree';
import { TreeTableModule } from 'primeng/treetable';
import { VirtualScrollerModule } from 'primeng/virtualscroller';
import { NgxSpinnerModule, NgxSpinnerComponent } from 'ngx-spinner';
import { AppComponent } from './app.component';
import { AppMenuComponent, AppSubMenuComponent } from './app.menu.component';
import { AppTopbarComponent } from './app.topbar.component';
import { AppFooterComponent } from './app.footer.component';
import { AppBreadcrumbComponent } from './app.breadcrumb.component';
import { AppRightpanelComponent } from './app.rightpanel.component';
import { AppInlineProfileComponent } from './app.profile.component';
import { BreadcrumbService } from './breadcrumb.service';
import { SbGridComponent } from './sb-grid/sb-grid.component';
import { KeyFigureBasicComponent } from './widgets/key-figure-basic/key-figure-basic.component';
import { SbLinechartComponent } from './widgets/sb-linechart/sb-linechart.component';
import { SbPanelComponent } from './sb-panel/sb-panel.component';
import { SbWidgetDirective } from './sb-widget.directive';
import { HighchartsChartModule } from 'highcharts-angular';
import { SbPiechartComponent } from './widgets/sb-piechart/sb-piechart.component';
import * as Highcharts from 'highcharts/highstock';
import more from 'highcharts/highcharts-more.src';
import solidGauge from 'highcharts/modules/solid-gauge.src';

import { SbColoredIconBoxComponent } from './widgets/sb-colored-icon-box/sb-colored-icon-box.component';
import { AgGridModule } from 'ag-grid-angular';
import { SbAgTableComponent } from './widgets/sb-ag-table/sb-ag-table.component';
import drilldown from 'highcharts/modules/drilldown';
import { DatePipe, DecimalPipe } from '@angular/common';
import { SbKeyFigureAdvancedComponent } from './widgets/sb-key-figure-advanced/sb-key-figure-advanced.component';
import { SbTablePieComponent } from './widgets/sb-table-pie/sb-table-pie.component';
import { SbAdvancedCellComponent } from './widgets/sb-advanced-cell/sb-advanced-cell.component';
import { SbMultiSelectComponent } from './widgets/sb-multi-select/sb-multi-select.component';
import { SbMultiselectCheckAllComponent } from './sb-dynamic-form/field-types/sb-multiselect-check-all/sb-multiselect-check-all.component';
import { SbEventBusService } from 'src/services/sb-event-bus.service';
import { SbMenuService } from 'src/services/sb-menu.service';
import { SbLoginComponent } from './sb-login/sb-login.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { SbUserFormComponent } from './sb-user-form/sb-user-form.component';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { CardWrapperComponent } from './wrappers/card.wrapper';
import { FieldsetWrapperComponent } from './wrappers/card.wrapper';
import { FormConfigResolver } from './resolvers/sb-form-data.resolver';
import { AppConfig } from './config/app.config';
more(Highcharts);
drilldown(Highcharts);
solidGauge(Highcharts);
import {
  FORMLY_MODULE,
  FORMLY_COMPONENTS
} from './sb-dynamic-form/FormlyConfig';
import { TextMaskModule } from 'angular2-text-mask';
import { FileUploadComponent } from './sb-upload/file-upload-component/file-upload.component';
import { SbFormWidgetComponent } from './widgets/sb-form-widget/sb-form-widget.component';
import { SbPropertiesService } from '../services/sb-properties.service';
import { BaseWidgetComponent } from './widgets/base-widget/base-widget.component';
import { LogoutResolver } from './resolvers/sb-logout.resolver';
import { LandingPageResolver } from './resolvers/sb-landing-page.resolver';
import { SbForgotPasswordComponent } from './sb-forgot-password/sb-forgot-password.component';
import { SbResetPasswordComponent } from './sb-reset-password/sb-reset-password.component';
import { UserIdleModule, UserIdleService } from 'angular-user-idle';
import { SbEvent } from '../services/sb-event';
import { SbEventTopic } from '../services/sb-event-topic';
import { SbIdleOverlayComponent } from './sb-overlay/sb-idle-overlay.component';
import { SbConnectionOverlayComponent } from './sb-overlay/sb-connection-overlay.component';
import { Router } from '@angular/router';
import { JExcelWrapperComponent } from './widgets/sb-jexcel/sb-jexcel-component/sb-jexcel.component';
import { SbExcelTableComponent } from './sb-excel-table/sb-excel-table.component';
import { SbPrivateEquityStaticTableComponent } from './sb-excel-table/sb-private-equity-static-table.component';
import { SbUploadWithPreviewComponent } from './sb-upload-with-preview/sb-upload-with-preview.component';
import { SbMenuComponent } from './sb-menu/sb-menu.component';
import { LayoutModule } from '@angular/cdk/layout';
import { MaterialModule } from './material/material.module';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { SbConfirmDialogComponent } from './sb-confirm-dialog/sb-confirm-dialog.component';
import { Ng5SliderModule } from 'ng5-slider';
import { SbMessagesComponent } from './sb-messages/sb-messages.component';
import { SbDialogComponent } from './sb-dialog/sb-dialog.component';
import { SbSnackbarComponent } from './sb-snackbar/sb-snackbar.component';
import { SbLogoutConfirmDialogComponent } from './sb-logout-confirm-dialog/sb-logout-confirm-dialog.component';
import { SbUploadWithPreviewDirective } from './sb-upload-with-preview/sb-upload-with-preview.directive';
import { SbPrintLayoutComponent } from './sb-grid/sb-print-layout/sb-print-layout.component';

@NgModule({
  imports: [
    BrowserModule,
    MaterialModule,
    CommonModule,
    FormsModule,
    AppRoutes,
    HttpClientModule,
    BrowserAnimationsModule,
    DragDropModule,
    AccordionModule,
    AutoCompleteModule,
    BreadcrumbModule,
    ButtonModule,
    CalendarModule,
    CardModule,
    CarouselModule,
    ChartModule,
    CheckboxModule,
    ChipsModule,
    CodeHighlighterModule,
    ConfirmDialogModule,
    ColorPickerModule,
    ContextMenuModule,
    DataViewModule,
    DialogModule,
    DropdownModule,
    EditorModule,
    FieldsetModule,
    FileUploadModule,
    FullCalendarModule,
    GalleriaModule,
    // GrowlModule,
    InplaceModule,
    InputMaskModule,
    InputSwitchModule,
    InputTextModule,
    InputTextareaModule,
    LightboxModule,
    ListboxModule,
    MegaMenuModule,
    MenuModule,
    MenubarModule,
    MessageModule,
    MessagesModule,
    MultiSelectModule,
    OrderListModule,
    OrganizationChartModule,
    OverlayPanelModule,
    PaginatorModule,
    PanelModule,
    PanelMenuModule,
    PasswordModule,
    PickListModule,
    ProgressBarModule,
    ProgressSpinnerModule,
    RadioButtonModule,
    RatingModule,
    ScrollPanelModule,
    SelectButtonModule,
    SlideMenuModule,
    SliderModule,
    SidebarModule,
    SpinnerModule,
    SplitButtonModule,
    StepsModule,
    TableModule,
    TabMenuModule,
    TabViewModule,
    TerminalModule,
    TieredMenuModule,
    ToastModule,
    ToggleButtonModule,
    ToolbarModule,
    TooltipModule,
    TreeModule,
    TreeTableModule,
    VirtualScrollerModule,
    HighchartsChartModule,
    AgGridModule.withComponents(null),
    ReactiveFormsModule,
    FORMLY_MODULE,
    FormlyPrimeNGModule,
    FormlyMaterialModule,
    KeyFilterModule,
    TextMaskModule,
    UserIdleModule.forRoot({ idle: 1200, timeout: 60 }),
    NgxSpinnerModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatDialogModule,
    MatExpansionModule,
    MatChipsModule,
    Ng5SliderModule
  ],
  declarations: [
    AppComponent,
    AppMenuComponent,
    AppSubMenuComponent,
    AppTopbarComponent,
    AppFooterComponent,
    AppBreadcrumbComponent,
    AppRightpanelComponent,
    AppInlineProfileComponent,
    SbGridComponent,
    KeyFigureBasicComponent,
    SbLinechartComponent,
    SbPanelComponent,
    SbWidgetDirective,
    SbPiechartComponent,
    SbGaugeComponent,
    SbColoredIconBoxComponent,
    SbAgTableComponent,
    SbKeyFigureAdvancedComponent,
    SbTablePieComponent,
    SbAdvancedCellComponent,
    SbMultiSelectComponent,
    SbLoginComponent,
    SbForgotPasswordComponent,
    SbResetPasswordComponent,
    PageNotFoundComponent,
    SbUserFormComponent,
    CardWrapperComponent,
    FieldsetWrapperComponent,
    FileUploadComponent,
    ...FORMLY_COMPONENTS,
    SbFormWidgetComponent,
    BaseWidgetComponent,
    SbConnectionOverlayComponent,
    SbIdleOverlayComponent,
    JExcelWrapperComponent,
    SbExcelTableComponent,
    SbPrivateEquityStaticTableComponent,
    SbUploadWithPreviewComponent,
    SbMenuComponent,
    SbConfirmDialogComponent,
    SbMessagesComponent,
    SbDialogComponent,
    SbSnackbarComponent,
    SbLogoutConfirmDialogComponent,
    SbUploadWithPreviewDirective,
    SbMultiselectCheckAllComponent,
    SbPrintLayoutComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  entryComponents: [
    KeyFigureBasicComponent,
    SbLinechartComponent,
    SbPiechartComponent,
    SbGaugeComponent,
    SbColoredIconBoxComponent,
    SbAgTableComponent,
    SbKeyFigureAdvancedComponent,
    SbAdvancedCellComponent,
    SbMultiSelectComponent,
    SbTablePieComponent,
    SbLoginComponent,
    PageNotFoundComponent,
    FileUploadComponent,
    SbFormWidgetComponent,
    SbConnectionOverlayComponent,
    SbIdleOverlayComponent,
    JExcelWrapperComponent,
    SbExcelTableComponent,
    SbPrivateEquityStaticTableComponent,
    SbConfirmDialogComponent,
    SbDialogComponent,
    SbLogoutConfirmDialogComponent
  ],
  providers: [
    AppConfig,
    {
      provide: APP_INITIALIZER,
      useFactory: initAppConfig,
      deps: [AppConfig],
      multi: true
    },
    UserIdleService,
    {
      provide: APP_INITIALIZER,
      useFactory: initConfig,
      deps: [UserIdleService, SbAuthenticationService, Injector, ConfirmationService, MatDialog],
      multi: true
    },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    BreadcrumbService,
    DatePipe,
    DecimalPipe,
    PercentPipe,
    SbEventBusService,
    SbAuthenticationService,
    SbMenuService,
    SbPropertiesService,
    ConfirmationService,
    MatDialog,
    FormConfigResolver,
    LogoutResolver,
    LandingPageResolver
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function initAppConfig(appConfig: AppConfig) {
  console.log('Loading app config...');
  // Function has to return promise if we are to make sure this completes before application continues loading (i.e., app.component etc)
  return (): Promise<any> => {
    return appConfig.load();
  };
}
// Note that module imports of type forRoot are imported before this is loaded.
// If that becomes an issue there is a workaround:
// https://github.com/angular/angular-cli/issues/3855#issuecomment-379141198
export function initConfig(
  idleService: UserIdleService,
  authentication: SbAuthenticationService,
  injector: Injector,
  confirmationService: ConfirmationService,
  dialog: MatDialog

) {
  console.log('Initializing session timers...');
  return () => {
    idleService.onTimerStart().subscribe(count => {
      if (authentication.isAuthenticated() && count === 1) {
        const dialogRef = dialog.open(SbConfirmDialogComponent, {
          width: '500px',
          hasBackdrop: true,
          disableClose: true,
          data: {
            title: 'Session Timeout Warning',
            message: 'Due to inactivity, your current work session is about to expire. For your security this session will automatically expire unless you click confirm to continue.',
            cancelText: `No`,
            confirmText: `Yes`,
            isSingleBtn: true
          }
        });
        this.submitSubscription = dialogRef.componentInstance.submitConfirm
          .subscribe(data => {
            idleService.stopTimer();
          });
        dialogRef.afterClosed().subscribe(() => {
          this.submitSubscription.unsubscribe();
        });
      }
    });

    // Start watch when time is up.
    idleService.onTimeout().subscribe(() => {
      idleService.stopTimer();
      if (authentication.isAuthenticated) {
        const router = injector.get(Router);
        router.navigate(['logout']);
      }
    });

  };

}
