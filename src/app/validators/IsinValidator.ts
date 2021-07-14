import { FormControl, ValidationErrors } from '@angular/forms';

function validateIsin(isin): boolean {
  // tslint:disable-next-line:max-line-length
  const re = /^(?:[A-Z]{2})(?:[A-Z0-9]{9})(?:[0-9]{1})$/;
  return re.test(String(isin));
}

export function IsinValidator(control: FormControl): ValidationErrors {
  if (control.dirty) {
    if (!validateIsin(control.value)) {
      return {
        isin: true
      };
    } else {
      return null;
    }
  } else {
    return null;
  }
}
