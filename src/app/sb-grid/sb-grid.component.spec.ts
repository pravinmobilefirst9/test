import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SbGridComponent } from './sb-grid.component';

describe('SbGridComponent', () => {
  let component: SbGridComponent;
  let fixture: ComponentFixture<SbGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SbGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SbGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
