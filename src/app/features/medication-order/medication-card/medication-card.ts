import { Component, input, OnInit, output, DestroyRef, inject } from '@angular/core';
import { MedicationForm } from '../../models/medication.model';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FREQUENCIES, ROUTES, DOSAGE_UNITS, AVAILABLE_DRUGS, } from '../../constants/mock-data';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormDirective } from '../../../shared/directive/form-directive';
import { isValidField } from '../../../shared/utils/form-utils';
import { MatIconModule } from '@angular/material/icon';
import { getErrorMessage } from '../../../shared/utils/form-utils';
@Component({
  selector: 'app-medication-card',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatCardModule, MatListModule, MatAutocompleteModule,FormDirective,MatIconModule],
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
  destroyRef = inject(DestroyRef);
  isValid=isValidField;
  errorMessage=getErrorMessage;
  ngOnInit(): void {
    this.drugSearchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(value => {
      const search = (value ?? '').toLocaleLowerCase();
      this.filteredDrugs = this.drugsName.filter(drug => drug.toLowerCase().includes(search));
    });
    this.group().controls.routes.valueChanges.pipe(
      startWith(this.group().controls.routes.value),
      takeUntilDestroyed(this.destroyRef)).subscribe(
        route => {
          const dosageControl = this.group().controls.dosage.controls.value;
          const instructionControl = this.group().controls.instructions;
          if (route === 'IV') {
            dosageControl.setValidators([
              Validators.required,
              Validators.min(0.1)
            ]);
            instructionControl.setValidators([
              Validators.required,
              Validators.minLength(20)
            ]);
          }
          else {
            dosageControl.setValidators([
              Validators.required,
              Validators.min(1)
            ]);
            instructionControl.clearValidators();

          }
          dosageControl.updateValueAndValidity();
          instructionControl.updateValueAndValidity();
        });
    this.group().controls.drugName.valueChanges.pipe(
      debounceTime(2000),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(value => {
      if (!value) return;
      const exists = this.drugsName.some(d => d.toLowerCase()===value.toLowerCase());
      const control=this.group().controls.drugName;
      exists?control.setErrors({drugExists:{name:value,id:'P-'+this.index()}}):control.setErrors(null);

      
    })
  }
  selectDrug(drug: string) {
    this.group().controls.drugName.setValue(drug);
    this.drugSearchControl.setValue('', { emitEvent: false });
    this.filteredDrugs = [];
  }
  removeMedication() {
    this.remove.emit(this.index());
  }
}
