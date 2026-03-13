import { Component, OnInit, inject,DestroyRef } from '@angular/core';
import { FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MedicationFormServices } from '../../../core/services/medication-form.services';
import { MedicationForm, MedicationOrderFormType } from '../../models/medication.model';
import { MedicationCard } from '../medication-card/medication-card';
import { THERAPY_TYPES ,PHYSICIANS} from '../../constants/mock-data';
import { startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {  MatFormFieldModule } from '@angular/material/form-field';
import {  MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-medication-order-form',
  imports: [ReactiveFormsModule,MedicationCard,MatFormFieldModule,MatInputModule,MatSelectModule,MatButtonModule,MatCardModule],
  templateUrl: './medication-order-form.html',
  styleUrl: './medication-order-form.css',
})
export class MedicationOrderForm implements OnInit {
  form!: MedicationOrderFormType;
  medications!:FormArray<MedicationForm>;
  formService = inject(MedicationFormServices);
  therapyTypes=THERAPY_TYPES;
  physicians=PHYSICIANS;
  destroyRef=inject(DestroyRef);
  therapyTypeValue:string|null=null;
   
  ngOnInit(): void {
    this.form=this.formService.createMedicationOrderForm();
    this.medications=this.form.controls.medications;
    const prescribing=this.form.controls.prescribingInfo;
    prescribing.controls.therapyType.valueChanges.pipe
    (startWith(prescribing.controls.therapyType.value),takeUntilDestroyed(this.destroyRef)).subscribe(
      therapy=>{
        this.therapyTypeValue=therapy;
        const diagnosisControl=prescribing.controls.diagnosis;
        const physicianControl=prescribing.controls.physicians;
        if(therapy === "Chemotherapy"){
          diagnosisControl.setValidators([
            Validators.required
          ]);
          physicianControl.setValidators([
            Validators.required,
            Validators.pattern(/^Dr\./)
          ])
        }else{
          diagnosisControl.clearValidators();
          physicianControl.setValidators([
            Validators.required
          ]);
        }
        diagnosisControl.updateValueAndValidity();
        physicianControl.updateValueAndValidity();
      }
    )
 
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
