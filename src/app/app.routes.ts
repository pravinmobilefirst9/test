import { SbUserFormComponent } from './sb-user-form/sb-user-form.component';
import { AuthGuardService } from './auth/auth-guard.service';
import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { SbGridComponent } from './sb-grid/sb-grid.component';
import { SbLoginComponent } from './sb-login/sb-login.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { environment } from '../environments/environment';
import { FileUploadComponent } from './sb-upload/file-upload-component/file-upload.component';
import { LogoutResolver } from './resolvers/sb-logout.resolver';
import { LandingPageResolver } from './resolvers/sb-landing-page.resolver';
import { SbForgotPasswordComponent } from './sb-forgot-password/sb-forgot-password.component';
import { SbResetPasswordComponent } from './sb-reset-password/sb-reset-password.component';
import { SbExcelTableComponent } from './sb-excel-table/sb-excel-table.component';
import { SbPrivateEquityStaticTableComponent } from './sb-excel-table/sb-private-equity-static-table.component';
import { SbUploadWithPreviewComponent } from './sb-upload-with-preview/sb-upload-with-preview.component';

const landingPage = environment.landingPageURL || '/';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '',
    canActivate: [AuthGuardService],
    resolve: {
      landingpage: LandingPageResolver
    }
  },
  {
    path: 'upload',
    canActivate: [AuthGuardService],
    component: FileUploadComponent
  },
  {
    path: 'uploadwithpreview',
    canActivate: [AuthGuardService],
    component: SbUploadWithPreviewComponent
  },
  {
    path: 'user-administration',
    canActivate: [AuthGuardService],
    component: SbUserFormComponent
  },
  {
    path: 'sb-grid/:gridPath',
    canActivate: [AuthGuardService],
    component: SbGridComponent
  },
  {
    path: 'sb-grid/:gridPath/:id',
    canActivate: [AuthGuardService],
    component: SbGridComponent
  },
  { path: 'login', component: SbLoginComponent },
  { path: 'forgot-password', component: SbForgotPasswordComponent },
  { path: 'reset-password', component: SbResetPasswordComponent },
  {
    path: 'logout',
    component: SbLoginComponent,
    resolve: { logout: LogoutResolver }
  },
  {
    path: 'private-equity-static',
    component: SbPrivateEquityStaticTableComponent
  },
  {
    path: 'not-found',
    canActivate: [AuthGuardService],
    component: PageNotFoundComponent
  },
  {
    path: '**',
    canActivate: [AuthGuardService],
    component: PageNotFoundComponent
  }
];

export const AppRoutes: ModuleWithProviders = RouterModule.forRoot(routes, {
  scrollPositionRestoration: 'enabled'
});
