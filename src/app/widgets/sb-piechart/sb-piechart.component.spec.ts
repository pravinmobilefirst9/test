import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SbPiechartComponent } from './sb-piechart.component';

describe('SbPiechartComponent', () => {
  let component: SbPiechartComponent;
  let fixture: ComponentFixture<SbPiechartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SbPiechartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SbPiechartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
