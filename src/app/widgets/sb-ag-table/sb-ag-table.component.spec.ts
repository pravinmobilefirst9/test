/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SbAgTableComponent } from './sb-ag-table.component';

describe('SbAgTableComponent', () => {
  let component: SbAgTableComponent;
  let fixture: ComponentFixture<SbAgTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SbAgTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SbAgTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
