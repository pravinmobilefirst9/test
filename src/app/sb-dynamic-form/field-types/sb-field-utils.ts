import { FieldType } from '@ngx-formly/core';

export abstract class SbFieldComponent extends FieldType {
  getClass() {
    if (this.to.readonly) {
      return 'class-readonly';
    }
  }
}
