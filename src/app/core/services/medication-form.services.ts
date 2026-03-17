import { Injectable,inject} from '@angular/core';
import {Validators, NonNullableFormBuilder, FormArray, FormGroup } from '@angular/forms';
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
        physicians:this.fb.control({value:'',disabled:true}),
        therapyType:['',[Validators.required,requiredDiagnosisValidator]],
        diagnosis:['']  
      }),
      medications:this.fb.array([this.createMedicationGroup()],duplicateDrugValidator)
    })
  };
  createDosageGroup(){
    return this.fb.group({
      value:[0,[Validators.required,dosageRangeValidator]],
      unit:['',Validators.required]
    })
  };
  //Creation of Medication Array
  createMedicationGroup():MedicationForm{
    return this.fb.group({
      drugName:['',Validators.required],
      dosage:this.createDosageGroup(),
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
  populateFromExisting(form:FormGroup,data:any):void{
    form.patchValue({
      patientInfo:data.patientInfo,
      prescribingInfo:data.prescribingInfo
    });
    const medication=form.get('medications')as FormArray;
    medication.clear();
    data.medications.forEach(()=>{
      medication.push(this.createMedicationGroup());
    });
    medication.patchValue(data.medications);
  }
  validateForm(form:FormGroup):boolean{
    form.markAllAsTouched();
    return form.valid;
  }
}
  
