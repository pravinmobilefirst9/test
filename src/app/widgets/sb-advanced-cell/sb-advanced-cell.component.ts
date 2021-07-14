import { first } from 'rxjs/operators';
import { Component, OnInit, Input, HostListener } from '@angular/core';
import { FormattingFunctions } from '../sb-ag-table/formatting-functions';
import { DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { config } from 'rxjs';
import { Router } from '@angular/router';
import { Context } from 'ag-grid-community';
import { SbPropertiesService } from '../../../services/sb-properties.service';
import * as dot from 'dot-prop';

@Component({
  selector: 'app-sb-advanced-cell',
  templateUrl: './sb-advanced-cell.component.html',
  styleUrls: ['./sb-advanced-cell.component.scss']
})
export class SbAdvancedCellComponent
  implements OnInit {
  @Input() context;
  @Input() value;
  @Input() columnConfiguration;
  @Input() defaultAlignment;

  locationEnums = [
    { location: 'top_left', alignment: 'left' },
    { location: 'top_right', alignment: 'right' },
    { location: 'bottom_left', alignment: 'left' },
    { location: 'bottom_right', alignment: 'right' }
  ];
  formattingFunctions: FormattingFunctions;

  constructor(
    dateFormatter: DatePipe,
    numberFormatter: DecimalPipe,
    percentFormatter: PercentPipe,
    propertiesService: SbPropertiesService
  ) {
    this.formattingFunctions = new FormattingFunctions(
      dateFormatter,
      numberFormatter,
      percentFormatter,
      propertiesService
    );
  }
  ngOnInit() {
    this.columnConfiguration = this.columnConfiguration || [];
  }

  getTextAlign(location) {
    const float = location.location.endsWith('left') ? 'left' : 'right';
    const clear = location.location.startsWith('bottom') ? float : 'none';
    return {
      'text-align': this.defaultAlignment || location.alignment,
      float,
      clear
    };
  }

  getValue(element: any, fieldPath: string) {
    if (element instanceof Object) {
      if (element[fieldPath]) {
        return element[fieldPath];
      } else {
        return dot.get(element, fieldPath);
      }
    } else {
      return element;
    }
  }

  getValues(location: string): any[] {
    if (!this.value) {
      return [];
    }
    const fieldsByLocation = this.columnConfiguration.filter(cc => {
      return cc.position === location && this.getValue(this.value, cc.field);
    });

    const mappedValues = fieldsByLocation.map((cc, index) => {
      const types = cc.type || [];
      const initialValue = this.getValue(this.value, cc.field);
      const cellClassRules = this.formattingFunctions.getCellClassRulesFromCellTypes(types, initialValue);
      const formattedText = this.formattingFunctions.getFormattedTextFromCellTypes(cc, types, initialValue);

      return {
        text: index > 0 ? ' ' + formattedText : formattedText,
        cssClasses: [...(cc.cssClasses || []), ...cellClassRules],
        inlineCss: cc.inlineCss || {},
        prefix: cc.prefix
          ? index > 0
            ? ' ' + cc.prefix + ' '
            : cc.prefix + ' '
          : cc.prefix,
        prefixCssClasses: cc.cssClasses || [],
        suffix: cc.suffix
        ? index > 0
          ? ' ' + cc.suffix + ' '
          : cc.suffix + ' '
        : cc.suffix,
      suffixCssClasses: cc.cssClasses || []
      };
    });
    return mappedValues;
  }
}
