import { Component, AfterViewInit, Input } from '@angular/core';
import { PRIVATE_EQUITY_STATIC_TABLE_DEFAULT_CONFIG } from '../config/excel.config';
import { CellValue, InitializationOptions, JExcelElement } from 'jexcel';

@Component({
  selector: 'app-private-equity-table-component',
  template: `
  <app-excel-table-component [options]="options" (change)="afterInit($event)"></app-excel-table-component>`
})
export class SbPrivateEquityStaticTableComponent implements AfterViewInit {

  initializationOptions: InitializationOptions = {
    allowComments: true,
    allowDeleteColumn: false,
    allowManualInsertRow: false,
    allowManualInsertColumn: false,
    loadingSpin: true
  };

  options = Object.assign({},
    PRIVATE_EQUITY_STATIC_TABLE_DEFAULT_CONFIG,
    { onchange: this.cellChanged, updateTable: this.updateTable },
    this.initializationOptions);

  excelElement?: JExcelElement;


  afterInit(excelElement: JExcelElement) {
    this.excelElement = excelElement;
    console.log('Got a handle to excel element');
  }

  ngAfterViewInit(): void {
    console.log('Insert custom logic for PE static table');
  }

  updateTable(instance: HTMLElement,
    cell: HTMLTableCellElement,
    col: number,
    row: number,
    val: CellValue,
    label: string,
    cellName: string) {
    // Odd row colours
    if (row % 2) {
      cell.style.backgroundColor = '#edf3ff';
    }
    console.log('Table updated');
  }

  cellChanged(instance: HTMLElement, cell: HTMLTableCellElement, columnIndex: string, rowIndex: string, value: CellValue): void {
    // tslint:disable-next-line: no-debugger
    console.log(`Row: ${rowIndex} Column: ${columnIndex} Value: ${value}`);
  }

}
