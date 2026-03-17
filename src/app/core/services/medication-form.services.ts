import { Injectable, inject } from '@angular/core';
import { Validators, NonNullableFormBuilder, FormArray, FormGroup } from '@angular/forms';
import { MedicationForm, MedicationOrderFormType } from '../../features/models/medication.model';
import { dosageRangeValidator, requiredDiagnosisValidator, duplicateDrugValidator } from '../validators/medication.validators';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class MedicationFormServices {
  private fb = inject(NonNullableFormBuilder);
  destroyRef = inject(DestroyRef);
  //Entire medication form
  createMedicationOrderForm(): MedicationOrderFormType {
    return this.fb.group({
      patientInfo: this.fb.group({
        patientId: ['', Validators.required],
        orderDate: ['', Validators.required]
      }),
      prescribingInfo: this.fb.group({
        physicians: this.fb.control({ value: '', disabled: true }),
        therapyType: ['', Validators.required],
        diagnosis: ['']
      },{validators: requiredDiagnosisValidator}),
      medications: this.fb.array([this.createMedicationGroup()], duplicateDrugValidator)
    });
  };
  createDosageGroup() {
    return this.fb.group({
      value: [0, [Validators.required, dosageRangeValidator]],
      unit: ['', Validators.required]
    })
  };
  //Creation of Medication Array
  createMedicationGroup(): MedicationForm {
    return this.fb.group({
      drugName: ['', Validators.required],
      dosage: this.createDosageGroup(),
      routes: ['', Validators.required],
      frequency: ['', Validators.required],
      instructions: ['']
    })
  };
  //Addition of new medication
  addMedication(form: MedicationOrderFormType) {
    const medications=form.controls.medications;
    if(medications.length>=10){
      return;
    }
    const medication = this.createMedicationGroup();
    this.setupMedicationLogic(medication,form.controls.medications.length);
    form.controls.medications.push(medication);
  };
  //Removal of existing medication
  removeMedication(form: MedicationOrderFormType, index: number) {
    const medication = form.controls.medications;
    if (medication.length > 1) {
      medication.removeAt(index);
    }
  };
  populateFromExisting(form: FormGroup, data: any): void {
    form.patchValue({
      patientInfo: data.patientInfo,
      prescribingInfo: data.prescribingInfo
    });
    const medication = form.get('medications') as FormArray;
    medication.clear();
    data.medications.forEach((_:any,index:number) => {
      const med=this.createMedicationGroup();
      this.setupMedicationLogic(med,index);
      medication.push(med);
    });
    medication.patchValue(data.medications);
  }
  validateForm(form: FormGroup): boolean {
    form.markAllAsTouched();
    return form.valid;
  }
  setupTherapyTypeValidation(form: MedicationOrderFormType) {
    const prescribing = form.controls.prescribingInfo;
    prescribing.controls.therapyType.valueChanges.pipe
      (startWith(prescribing.controls.therapyType.value), takeUntilDestroyed(this.destroyRef)).subscribe(
        therapy => {
          const diagnosisControl = prescribing.controls.diagnosis;
          const physicianControl = prescribing.controls.physicians;
          if (therapy) {
            physicianControl.enable();
          } else {
            physicianControl.disable();
          }
          diagnosisControl.setErrors(null);
          physicianControl.setErrors(null);
          if (therapy === "Chemotherapy") {
            diagnosisControl.setValidators([
              Validators.required
            ]);
            physicianControl.setValidators([
              Validators.required,
              Validators.pattern(/^Dr\.\s[A-Za-z]+$/)
            ])
          } else {
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
  private drugs:string[]=[];
  setDrugs(drugs:string[]){
    this.drugs=drugs;
  }
  setupRouteValidation(medication: MedicationForm) {
    medication.controls.routes.valueChanges.pipe(
      startWith(medication.controls.routes.value),
      takeUntilDestroyed(this.destroyRef)).subscribe(
        route => {
          const dosageControl = medication.controls.dosage.controls.value;
          const instructionControl = medication.controls.instructions;
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
  }
  setupDrugValidation(medication:MedicationForm,index:number){
    const control=medication.controls.drugName;
    control.valueChanges.pipe(
      debounceTime(2000),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(value => {
      if (!value) return;
      const exists = this.drugs.some(d => d.toLowerCase() === value.toLowerCase());
      const errors=control.errors || {};
      if(exists){
        control.setErrors({
          ...errors, drugExists:{name:value,id:'P-' + index}
        })
      }else{
        delete errors['drugExists'];
        control.setErrors(Object.keys(errors).length?errors:null);
      }
    
    })
  }
  setupMedicationLogic(medication:MedicationForm,index:number){
    this.setupRouteValidation(medication);
    this.setupDrugValidation(medication,index);
  }
   initializeForm(form:MedicationOrderFormType){
    this.setupTherapyTypeValidation(form);
    form.controls.medications.controls.forEach((med,index)=>{
      this.setupMedicationLogic(med,index);
    })
   }
}

