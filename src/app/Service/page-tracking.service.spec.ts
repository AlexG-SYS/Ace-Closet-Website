import { TestBed } from '@angular/core/testing';

import { PageTrackingService } from './page-tracking.service';

describe('PageTrackingService', () => {
  let service: PageTrackingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PageTrackingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
