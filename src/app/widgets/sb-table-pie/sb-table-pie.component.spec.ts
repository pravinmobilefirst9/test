import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SbTablePieComponent } from './sb-table-pie.component';

describe('SbTablePieComponent', () => {
  let component: SbTablePieComponent;
  let fixture: ComponentFixture<SbTablePieComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SbTablePieComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SbTablePieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
