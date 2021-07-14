import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { JExcelElement } from 'jexcel';

@Component({
  selector: 'app-excel-table-component',
  template: `
  <app-jexcel [options]="options" (change)="delegate($event)"></app-jexcel>`
})
export class SbExcelTableComponent implements OnInit {

  @Input() options;

  @Output() change = new EventEmitter<JExcelElement>();

  delegate($event: JExcelElement) {
    this.change.emit($event);
  }

  ngOnInit() {
    if (!this.options) {
      console.error('Spreadsheet configuration options are missing.');
    }
  }

}
