import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicationOrderForm } from './medication-order-form';

describe('MedicationOrderForm', () => {
  let component: MedicationOrderForm;
  let fixture: ComponentFixture<MedicationOrderForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicationOrderForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicationOrderForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
