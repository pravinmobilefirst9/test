import { Component, Input, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-sb-multiselect-check-all',
  templateUrl: './sb-multiselect-check-all.component.html',
  styleUrls: ['./sb-multiselect-check-all.component.scss']
})
export class SbMultiselectCheckAllComponent {
  @Input() model: FormControl;
  @Input() values = [];
  @Input() text = 'Select All';

  isChecked(): boolean {
    if (!this.isInitialized()) { return false; }

    return this.model.value && this.values.length
      && this.model.value.length === this.values.length;
  }

  isIndeterminate(): boolean {
    if (!this.isInitialized()) { return false; }

    return this.model.value && this.values.length && this.model.value.length
      && this.model.value.length < this.values.length;
  }

  toggleSelection(change: MatCheckboxChange): void {
    if (change.checked) {
      // this.values contains an array with the mat-select object model { value: string; label: string }
      const modelValues = this.values ? this.values.map(v => v.value) : [];
      this.model.setValue(modelValues);
    } else {
      this.model.setValue([]);
    }
  }

  isInitialized(): boolean {
    // On initial load this is called when component initializes and we can get a state where model or values is undefined
    if (!this.model || !this.values) { return false; }
    return true;
  }
}
