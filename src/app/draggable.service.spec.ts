import { TestBed } from '@angular/core/testing';

import { DraggableService } from './draggable.service';

describe('DraggableService', () => {
  let service: DraggableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DraggableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
