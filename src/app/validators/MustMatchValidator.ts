import { FormControl, ValidationErrors } from '@angular/forms';

export function MustMatchValidator(
  control: FormControl,
  configuration
): ValidationErrors {
  if (control.dirty) {
    const keyPath = configuration.templateOptions.mustMatch;
    const model = control.root.value;
    const value = keyPath.split('.').reduce((o, i) => o[i], model);
    if (value === control.value) {
      return null;
    } else {
      return {
        mustMatch: true
      };
    }
  }
  return null;
}
