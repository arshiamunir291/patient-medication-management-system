import { Component, input, OnInit, output } from '@angular/core';
import { MedicationForm } from '../../models/medication.model';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FREQUENCIES, ROUTES, DOSAGE_UNITS, AVAILABLE_DRUGS, } from '../../constants/mock-data';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs';
@Component({
  selector: 'app-medication-card',
  imports: [ReactiveFormsModule],
  templateUrl: './medication-card.html',
  styleUrl: './medication-card.css',
})
export class MedicationCard implements OnInit {
  group = input.required<MedicationForm>();
  index = input.required<number>();
  totalMedication = input.required<number>();
  remove = output<number>();
  routes = ROUTES;
  frequencies = FREQUENCIES;
  dosageUnits = DOSAGE_UNITS;
  drugsName = AVAILABLE_DRUGS;
  filteredDrugs: string[] = [];
  drugSearchControl = new FormControl<string>('');
  ngOnInit(): void {
    this.drugSearchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.filteredDrugs = this.drugsName.filter(drug => drug.toLowerCase().includes(value?.toLowerCase() ?? ''));
    });
  }
  selectDrug(drug:string){
    this.group().controls.drugName.setValue(drug);
    this.filteredDrugs=[];
  }
  removeMedication() {
    this.remove.emit(this.index());
  }
}
