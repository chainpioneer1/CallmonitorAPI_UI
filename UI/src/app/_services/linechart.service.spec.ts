import { TestBed, inject } from '@angular/core/testing';

import { LinechartService } from './linechart.service';

describe('LinechartService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LinechartService]
    });
  });

  it('should be created', inject([LinechartService], (service: LinechartService) => {
    expect(service).toBeTruthy();
  }));
});
