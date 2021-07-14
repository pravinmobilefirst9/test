import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SbPanelComponent } from './sb-panel.component';

describe('SbPanelComponent', () => {
  let component: SbPanelComponent;
  let fixture: ComponentFixture<SbPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SbPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SbPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
