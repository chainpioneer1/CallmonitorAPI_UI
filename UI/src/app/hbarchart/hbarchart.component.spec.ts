import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HbarchartComponent } from './hbarchart.component';

describe('HbarchartComponent', () => {
  let component: HbarchartComponent;
  let fixture: ComponentFixture<HbarchartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HbarchartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HbarchartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
