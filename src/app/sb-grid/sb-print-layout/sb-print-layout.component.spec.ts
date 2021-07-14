import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SbPrintLayoutComponent } from './sb-print-layout.component';

describe('SbPrintLayoutComponent', () => {
  let component: SbPrintLayoutComponent;
  let fixture: ComponentFixture<SbPrintLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SbPrintLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SbPrintLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
