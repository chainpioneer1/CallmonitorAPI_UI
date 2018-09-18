import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiSeriesHighchartComponent } from './multi-series-highchart.component';

describe('MultiSeriesHighchartComponent', () => {
  let component: MultiSeriesHighchartComponent;
  let fixture: ComponentFixture<MultiSeriesHighchartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiSeriesHighchartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiSeriesHighchartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
