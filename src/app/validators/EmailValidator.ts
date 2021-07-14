import { FormControl, ValidationErrors } from '@angular/forms';

function validateEmail(email): boolean {
  // tslint:disable-next-line:max-line-length
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

export function EmailValidator(control: FormControl): ValidationErrors {
  if (control.dirty) {
    if (!validateEmail(control.value)) {
      return {
        email: true
      };
    } else {
      return null;
    }
  } else {
    return null;
  }
}
