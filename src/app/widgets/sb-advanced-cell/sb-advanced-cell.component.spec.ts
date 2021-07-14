/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SbAdvancedCellComponent } from './sb-advanced-cell.component';

describe('SbAdvancedCellComponent', () => {
  let component: SbAdvancedCellComponent;
  let fixture: ComponentFixture<SbAdvancedCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SbAdvancedCellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SbAdvancedCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
