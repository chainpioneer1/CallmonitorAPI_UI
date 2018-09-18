import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VbarChartComponent } from './vbar-chart.component';

describe('VbarChartComponent', () => {
  let component: VbarChartComponent;
  let fixture: ComponentFixture<VbarChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VbarChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VbarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
