import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MedicationFormServices } from '../../../core/services/medication-form.services';
import { MedicationForm, MedicationOrderFormType } from '../../models/medication.model';
import { MedicationCard } from '../medication-card/medication-card';
import { THERAPY_TYPES } from '../../constants/mock-data';



@Component({
  selector: 'app-medication-order-form',
  imports: [ReactiveFormsModule,MedicationCard],
  templateUrl: './medication-order-form.html',
  styleUrl: './medication-order-form.css',
})
export class MedicationOrderForm implements OnInit {
  form!: MedicationOrderFormType;
  medications!:FormArray<MedicationForm>;
  formService = inject(MedicationFormServices);
  therapyTypes=THERAPY_TYPES;

  ngOnInit(): void {
    this.form=this.formService.createMedicationOrderForm();
    this.medications=this.form.controls.medications;
 
  }
  addMedication(){
    this.formService.addMedication(this.form);
  }
  removeMedication(index:number){
    this.formService.removeMedication(this.form,index);
  }
  submitForm(){
    if(this.form.valid){
      console.log(this.form.getRawValue());
    }
  }
}
