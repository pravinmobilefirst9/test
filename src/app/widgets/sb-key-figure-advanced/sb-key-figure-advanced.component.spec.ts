/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SbKeyFigureAdvancedComponent } from './sb-key-figure-advanced.component';

describe('SbKeyFigureAdvancedComponent', () => {
  let component: SbKeyFigureAdvancedComponent;
  let fixture: ComponentFixture<SbKeyFigureAdvancedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SbKeyFigureAdvancedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SbKeyFigureAdvancedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
