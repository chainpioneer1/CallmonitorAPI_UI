import { TestBed, inject } from '@angular/core/testing';

import { BarchartService } from './barchart.service';

describe('BarchartService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BarchartService]
    });
  });

  it('should be created', inject([BarchartService], (service: BarchartService) => {
    expect(service).toBeTruthy();
  }));
});
