import { FormlyFieldConfig } from '@ngx-formly/core';
import { takeUntil, startWith, tap } from 'rxjs/operators';

export const userModel = {
  userInfo: {
    email: null,
    roles: []
  },
  password: {
    password: '',
    matchingPassword: ''
  }
};
export const updateUserFormFields: FormlyFieldConfig[] = [
  {
    key: 'email',
    type: 'input',
    className: 'ui-g-12 ui-md-4 md-inputfield',
    templateOptions: {
      type: 'email',
      label: 'Email address',
      placeholder: 'Enter email',
      readonly: true
    }
  },
  {
    key: 'roles',
    className: 'ui-g-12 ui-md-4 md-inputfield',
    type: 'select',
    templateOptions: {
      type: 'select',
      label: 'Select roles',
      placeholder: 'Roles',
      required: true,
      options: [
        { value: 'USER', label: 'USER' },
        { value: 'ADMINISTRATOR', label: 'ADMINISTRATOR' }
      ]
    }
  }
];

export const createUserFormFields: FormlyFieldConfig[] = [
  {
    key: 'userInfo',
    wrappers: ['card'],
    templateOptions: { label: 'E-mail and Role' },
    fieldGroup: [
      {
        key: 'email',
        type: 'input',
        className: 'ui-g-12 ui-md-4 md-inputfield',
        templateOptions: {
          type: 'email',
          label: 'Email address',
          placeholder: 'Enter email',
          required: true
        }
      },
      {
        key: 'roles',
        className: 'ui-g-12 ui-md-4 md-inputfield',
        type: 'select',
        templateOptions: {
          type: 'select',
          label: 'Select roles',
          placeholder: 'Roles',
          required: true,
          options: [
            { value: 'USER', label: 'USER' },
            { value: 'ADMINISTRATOR', label: 'ADMINISTRATOR' }
          ]
        }
      }
    ]
  },
  {
    key: 'password',
    wrappers: ['card'],
    templateOptions: { label: 'Password' },
    fieldGroup: [
      {
        key: 'password',
        type: 'input',
        className: 'ui-g-12 ui-md-4 md-inputfield',
        templateOptions: {
          type: 'password',
          label: 'Password',
          placeholder: 'Must be at least 3 characters',
          required: true,
          minLength: 3
        }
      },
      {
        key: 'matchingPassword',
        type: 'input',
        className: 'ui-g-12 ui-md-4 md-inputfield',
        templateOptions: {
          type: 'password',
          label: 'Confirm password',
          placeholder: 'Please re-enter your password',
          required: true
        },
        validation: {
          messages: {
            match: 'Password must match'
          }
        },
        validators: {
          match: function(control, formgroup) {
            return control.value === formgroup.form.value.password;
          }
        }
      }
    ]
  }
];
