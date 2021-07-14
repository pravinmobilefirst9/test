import { Component, OnInit, AfterViewInit, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import * as jexcel from 'jexcel';
import { JExcelElement } from 'jexcel';

@Component({
  selector: 'app-jexcel',
  template: `
    <div #sheet></div>
  `,
  styles: [`{
  }`]
})
export class JExcelWrapperComponent implements OnInit, AfterViewInit {

  @ViewChild('sheet', {static: true}) sheet: ElementRef;

  @Input() options: jexcel.Options = {};

  @Output() change = new EventEmitter<JExcelElement>();

  ngOnInit() {
  }

  ngAfterViewInit() {
    const excelElement = jexcel(this.sheet.nativeElement, this.options);
    this.change.emit(excelElement);
  }

}
