import { TestBed } from '@angular/core/testing';

import { MedicationFormServices } from './medication-form.services';

describe('MedicationFormServices', () => {
  let service: MedicationFormServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MedicationFormServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
