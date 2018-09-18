import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiSeriesComponent } from './multi-series.component';

describe('MultiSeriesComponent', () => {
  let component: MultiSeriesComponent;
  let fixture: ComponentFixture<MultiSeriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiSeriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiSeriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
