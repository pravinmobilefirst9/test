import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SbMultiselectCheckAllComponent } from './sb-multiselect-check-all.component';

describe('SbMultiselectCheckAllComponent', () => {
  let component: SbMultiselectCheckAllComponent;
  let fixture: ComponentFixture<SbMultiselectCheckAllComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SbMultiselectCheckAllComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SbMultiselectCheckAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
