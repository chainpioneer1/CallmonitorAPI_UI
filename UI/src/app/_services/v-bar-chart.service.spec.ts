import { TestBed, inject } from '@angular/core/testing';

import { VBarChartService } from './v-bar-chart.service';

describe('VBarChartService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VBarChartService]
    });
  });

  it('should be created', inject([VBarChartService], (service: VBarChartService) => {
    expect(service).toBeTruthy();
  }));
});
