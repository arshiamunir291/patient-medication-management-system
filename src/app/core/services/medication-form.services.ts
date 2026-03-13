import { Injectable,inject} from '@angular/core';
import {Validators, NonNullableFormBuilder } from '@angular/forms';
import { MedicationForm, MedicationOrderFormType } from '../../features/models/medication.model';
import { dosageRangeValidator, requiredDiagnosisValidator ,duplicateDrugValidator} from '../validators/medication.validators';

@Injectable({
  providedIn: 'root',
})
export class MedicationFormServices {
  private fb=inject(NonNullableFormBuilder);
  //Entire medication form
  createMedicationOrderForm():MedicationOrderFormType{
    return this.fb.group({
      patientInfo:this.fb.group({
        patientId:['',Validators.required],
        orderDate:['',Validators.required]
      }),
      prescribingInfo:this.fb.group({
        physicians:[''],
        therapyType:['',[Validators.required,requiredDiagnosisValidator]],
        diagnosis:['']  
      }),
      medications:this.fb.array([this.createMedicationGroup()],duplicateDrugValidator)
    })
  };
  //Creation of Medication Array
  createMedicationGroup():MedicationForm{
    return this.fb.group({
      drugName:['',Validators.required],
      dosage:this.fb.group({
        value:[0,dosageRangeValidator],
        unit:['',Validators.required]
      }),
      routes:['',Validators.required],
      frequency:['',Validators.required],
      instructions:['']
    })
  };
  //Addition of new medication
  addMedication(form:MedicationOrderFormType){
    const medication=form.controls.medications;
    if(medication.length <10){
      medication.push(this.createMedicationGroup());
    }
  };
  //Removal of existing medication
  removeMedication(form:MedicationOrderFormType,index:number){
    const medication=form.controls.medications;
    if(medication.length >1){
      medication.removeAt(index);
    }
  };
}
  