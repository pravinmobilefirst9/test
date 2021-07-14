import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { FormConfigContext } from '../sb-form-configuration/sb-form-context';
import { SbFormContextService } from 'src/services/sb-form-context.service';

@Injectable()
export class FormConfigResolver implements Resolve<Promise<FormConfigContext>> {
  formConfigBaseUrl: string;
  gatewayBaseUrl: string;

  constructor(
    private router: Router,
    private formConfigService: SbFormContextService
  ) { }

  async resolve(route: ActivatedRouteSnapshot) {
    try {
      const formId = route.paramMap.get('formId');
      const entityId = route.paramMap.get('id');
      return await this.formConfigService.getFormConfig(formId, entityId).toPromise();
    } catch (error) {
      console.log(error);
      // todo - do we need the rest of the error handling if we are wrapping everything in try catch?
      this.router.navigate(['not-found']);
    }
  }
}
