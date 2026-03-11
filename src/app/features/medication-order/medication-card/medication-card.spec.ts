import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicationCard } from './medication-card';

describe('MedicationCard', () => {
  let component: MedicationCard;
  let fixture: ComponentFixture<MedicationCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicationCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicationCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
