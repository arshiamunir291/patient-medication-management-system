import { Component, input, output } from '@angular/core';
import { MedicationForm } from '../../models/medication.model';
import { ReactiveFormsModule } from '@angular/forms';
import { FREQUENCIES,ROUTES,DOSAGE_UNITS, } from '../../constants/mock-data';
@Component({
  selector: 'app-medication-card',
  imports: [ReactiveFormsModule],
  templateUrl: './medication-card.html',
  styleUrl: './medication-card.css',
})
export class MedicationCard {
  group=input.required<MedicationForm>();
  index=input.required<number>();
  remove=output<number>();
  routes=ROUTES;
  frequencies=FREQUENCIES;
  dosageUnits=DOSAGE_UNITS;
  removeMedication(){
    this.remove.emit(this.index());
  }
}
