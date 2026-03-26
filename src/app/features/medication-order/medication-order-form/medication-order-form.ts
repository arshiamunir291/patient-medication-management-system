import { Component, OnInit, inject, DestroyRef, HostListener } from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MedicationFormServices } from '../../../core/services/medication-form.services';
import { MedicationForm, MedicationOrderFormType } from '../../models/medication.model';
import { MedicationCard } from '../medication-card/medication-card';
import { THERAPY_TYPES, PHYSICIANS, AVAILABLE_DRUGS } from '../../constants/mock-data';
import { debounceTime, filter, tap} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { StorageService } from '../../../shared/utils/storage.service';
import { DatePipe } from '@angular/common';
import { FormDirective } from '../../../shared/directive/form-directive';
import { MatSnackBar } from '@angular/material/snack-bar';
import { isValidField, getErrorMessage } from '../../../shared/utils/form-utils';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
@Component({
  selector: 'app-medication-order-form',
  imports: [ReactiveFormsModule,
    MedicationCard,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule, MatBadgeModule,
    DatePipe,
    FormDirective,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './medication-order-form.html',
  styleUrl: './medication-order-form.css',
})
export class MedicationOrderForm implements OnInit {
  form!: MedicationOrderFormType;
  medications!: FormArray<MedicationForm>;
  formService = inject(MedicationFormServices);
  storageService = inject(StorageService);
  therapyTypes = THERAPY_TYPES;
  physicians = PHYSICIANS;
  destroyRef = inject(DestroyRef);
  showUnsavedBadge = false;
  private readonly DRAFT_KEY = 'medication-order-draft';
  lastSaved: Date | null = null;
  isViewMode = false;
  modifiedFields: string[] = [];
  snackBar = inject(MatSnackBar);
  isValid = isValidField;
  errorMessage = getErrorMessage;
  minDate = new Date();
  availableDrugs = AVAILABLE_DRUGS;

  ngOnInit(): void {
    this.form = this.formService.createMedicationOrderForm();
    this.medications=this.form.controls.medications;
    this.formService.setDrugs(this.availableDrugs);
    this.formService.initializeForm(this.form);
    //to show the modified fields
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      console.log('Form Valid:', this.form.valid);
      this.showUnsavedBadge = this.form.dirty;
      this.modifiedFields = (Object.keys(this.form.controls) as (keyof typeof this.form.controls)[]).filter(key => this.form.controls[key].dirty);
      console.log('Modified FIelds:', this.modifiedFields);
    })
    // for auto saving draft
    this.form.valueChanges.pipe(
      debounceTime(5000),
      filter(() => this.form.valid && this.form.dirty),
      tap(() => {
        this.saveDraft();
      }),
      takeUntilDestroyed(this.destroyRef)).subscribe();
  }
  //add medication in form
  addMedication() {
    this.formService.addMedication(this.form);
  }
  //remove medication
  removeMedication(index: number) {
    this.formService.removeMedication(this.form, index);
  }
  //submit button logic
submitForm() {
 if (!this.formService.validateForm(this.form)) {
    this.showValidationSummary();
    return;
  }
  this.form.reset({
    patientInfo:{
      patientId:'',
      orderDate:''
    },
    prescribingInfo:{
      physicians:'',
      therapyType:'',
      diagnosis:''
    }
  });
  this.form.markAsUntouched();
  this.form.markAsPristine();
  this.form.updateValueAndValidity();
  // this.formService.initializeForm(this.form)
  // Log submitted data
  console.log(this.form.getRawValue());
  console.log(this.form.value);
  this.showUnsavedBadge = false;
  this.storageService.clearDraft(this.DRAFT_KEY);
  this.snackBar.open('Medication order submitted successfully', 'Close', { duration: 3000 });
} //save the draft
  saveDraft() {
    const formData = this.form.getRawValue();
    this.storageService.saveDraft(this.DRAFT_KEY, formData);
    this.lastSaved = new Date();
    this.showUnsavedBadge = false;

  }
  //restore draft
  restoreDraft() {
    const draft = this.storageService.getDraft(this.DRAFT_KEY);
    if (!draft) return;
    const data = draft.data;
    this.form.patchValue({
      patientInfo: data.patientInfo,
      prescribingInfo: data.prescribingInfo
    });
    const medicationArray = this.form.controls.medications;
    medicationArray.clear();
    data.medications.forEach((_:any,index:number) => {
      const med=this.formService.createMedicationGroup();
      this.formService.setupMedicationLogic(med,index);
      medicationArray.push(med);
    });
    medicationArray.patchValue(data.medications);
    this.form.markAsPristine();
    this.lastSaved = new Date(draft.timestamp);
  }
  // toggle to view mode of form
  toggleViewMode() {
    this.isViewMode = !this.isViewMode;
    if (this.isViewMode) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }
  //clear all the field except patinetInfo
  clearAll() {
    const patientInformation = this.form.controls.patientInfo.value;
    this.form.reset({
      patientInfo: patientInformation,
      prescribingInfo: {
        physicians: '',
        therapyType: '',
        diagnosis: ''
      }
    });
    const medicationArray = this.form.controls.medications;
    medicationArray.clear();
    this.formService.addMedication(this.form)
  }
  //discard the changes
  discardChanges() {
    const draft = this.storageService.getDraft(this.DRAFT_KEY);
    if (!draft) return;
    const data = draft.data;
    this.form.patchValue({
      patientInfo: data.patientInfo,
      prescribingInfo: data.prescribingInfo
    });
    const medicationArray = this.form.controls.medications;
    medicationArray.clear();
    data.medications.forEach((_:any,index:number) => {
      const med=this.formService.createMedicationGroup();
      this.formService.setupMedicationLogic(med,index);
      medicationArray.push(med);
    });
    medicationArray.patchValue(data.medications);
    this.form.markAsPristine();
  }
  //for showing confirmation on reolading
  @HostListener('window:beforeunload', ['$event']) handleUnload(e: BeforeUnloadEvent) {
    if (this.form.dirty) {
      e.preventDefault();
       e.returnValue = '';
    }
  }
  //patch values demo
  editMode() {
    console.log('Edit Mode: patchValue allows partial updates ');
    this.form.patchValue({
      prescribingInfo: {
        therapyType: 'Chemotherapy'
      }
    });
    console.log('Updated field:prescribingInfo.therapyType');
  }
  //set values demo
  duplicateMode() {
    console.log('Duplicate Mode: setValue requires full object');
    try {
      this.form.setValue({
        patientInfo: {
          patientId: 'P1001',
          orderDate: '2026-03-20'
        },
        prescribingInfo: {
          physicians: 'Dr. Smith',
          therapyType: 'Chemotherapy',
          diagnosis: 'Cancer'
        },
        medications: [
          {
            drugName: 'Aspirin',
            dosage: { value: 10, unit: 'mg' },
            routes: 'Oral',
            frequency: 'Daily',
            instructions: 'After every meal with luke warm water or tea'
          }
        ]
      });
    } catch (error) {
      console.error('setValue Error:Missing field!', error);
    }
  }
  //show validation  summary of all fields
  showValidationSummary() {
    const fields = [
      ['patientInfo.patientId', 'Patient Id'],
      ['patientInfo.orderDate', 'Order Date'],
      ['prescribingInfo.physicians', 'Physician'],
      ['prescribingInfo.therapyType', 'Therapy Type'],
      ['prescribingInfo.diagnosis', 'Diagnosis'],
    ];
    const errors = fields.map(([path, label]) => {
      const msg = this.errorMessage(this.form, path);
      return msg ? `${label}:${msg}` : null;
    }).filter(Boolean) as string[];

    this.medications.controls.forEach((_, i) => {
      const base = `medications.${i}`;
      const medFields = [
        ['drugName', 'Drug Name'],
        ['dosage.value', 'Dosage'],
        ['dosage.unit', 'Unit'],
        ['routes', 'Route'],
        ['frequency', 'Frequency'],
        ['instructions', 'Instructions'],
      ];
      medFields.forEach(([key, label]) => {
        const msg = this.errorMessage(this.form, `${base}.${key}`);
        if (msg) errors.push(`Medication ${i + 1} - ${label}: ${msg}`);
      });
    });
    if (errors.length) {
      alert("Please fix the following errors:\n\n" + errors.join('\n'));
    }
  }
  //functin to used to show the check mark to valid fields
  showValidationIcon(controlName: string) {
    const control = this.form.get(controlName);
    return control?.touched && control?.valid;
  }
  
}
