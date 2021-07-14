import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { LicenseManager } from 'ag-grid-enterprise';

LicenseManager.setLicenseKey('Evaluation_License-_Not_For_Production_Valid_Until_11_April_2019__MTU1NDkzNzIwMDAwMA==621338d31bd07134d7677320badd116a');

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
