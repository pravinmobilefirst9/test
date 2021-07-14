import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SbLinechartComponent } from './sb-linechart.component';

describe('SbLinechartComponent', () => {
  let component: SbLinechartComponent;
  let fixture: ComponentFixture<SbLinechartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SbLinechartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SbLinechartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
