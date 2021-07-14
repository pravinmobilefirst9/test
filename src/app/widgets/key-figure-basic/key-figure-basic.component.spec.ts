import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyFigureBasicComponent } from './key-figure-basic.component';

describe('KeyFigureBasicComponent', () => {
  let component: KeyFigureBasicComponent;
  let fixture: ComponentFixture<KeyFigureBasicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KeyFigureBasicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyFigureBasicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
