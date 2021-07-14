import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SbFormWidgetComponent } from './sb-form-widget.component';

describe('SbFormWidgetComponent', () => {
  let component: SbFormWidgetComponent;
  let fixture: ComponentFixture<SbFormWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SbFormWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SbFormWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
