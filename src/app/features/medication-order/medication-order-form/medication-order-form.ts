import { Component, OnInit, inject, DestroyRef, HostListener } from '@angular/core';
import { FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MedicationFormServices } from '../../../core/services/medication-form.services';
import { MedicationForm, MedicationOrderFormType } from '../../models/medication.model';
import { MedicationCard } from '../medication-card/medication-card';
import { THERAPY_TYPES, PHYSICIANS } from '../../constants/mock-data';
import { startWith, debounceTime, filter, tap, take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { StorageService } from '../../../shared/utils/storage.service';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-medication-order-form',
  imports: [ReactiveFormsModule, MedicationCard, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatCardModule, MatBadgeModule, DatePipe],
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
  therapyTypeValue: string | null = null;
  showUnsavedBadge = false;
  private readonly DRAFT_KEY = 'medication-order-draft';
  lastSaved: Date | null = null;
  isViewMode = false;
  modifiedFields: string[] = [];

  ngOnInit(): void {
    this.form = this.formService.createMedicationOrderForm();
    this.medications = this.form.controls.medications;
    const prescribing = this.form.controls.prescribingInfo;
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      console.log('Form Valid:', this.form.valid);
      this.showUnsavedBadge = this.form.dirty;
      this.modifiedFields = (Object.keys(this.form.controls) as (keyof typeof this.form.controls)[]).filter(key => this.form.controls[key].dirty);
      console.log('Modified FIelds:', this.modifiedFields);

    })
    this.form.valueChanges.pipe(
      debounceTime(5000),
      filter(() => this.form.valid && this.form.dirty),
      tap(() => {
        this.saveDraft();
      }),
      takeUntilDestroyed(this.destroyRef)).subscribe();
    prescribing.controls.therapyType.valueChanges.pipe
      (startWith(prescribing.controls.therapyType.value), takeUntilDestroyed(this.destroyRef)).subscribe(
        therapy => {
          this.therapyTypeValue = therapy;
          const diagnosisControl = prescribing.controls.diagnosis;
          const physicianControl = prescribing.controls.physicians;
          if (therapy) {
            physicianControl.enable();
          } else {
            physicianControl.disable();
          }
          if (therapy === "Chemotherapy") {
            diagnosisControl.setValidators([
              Validators.required
            ]);
            physicianControl.setValidators([
              Validators.required,
              Validators.pattern(/^Dr\./)
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
  addMedication() {
    this.formService.addMedication(this.form);
  }
  removeMedication(index: number) {
    this.formService.removeMedication(this.form, index);
  }
  submitForm() {
    if (this.form.valid) {
      console.log(this.form.getRawValue());
      console.log(this.form.value)
      this.showUnsavedBadge = false;
      this.storageService.clearDraft(this.DRAFT_KEY);
      this.form.reset();
      this.form.markAsPristine();
    }
  }
  saveDraft() {
    const formData = this.form.getRawValue();
    this.storageService.saveDraft(this.DRAFT_KEY, formData);
    this.lastSaved = new Date();
    this.showUnsavedBadge = false;

  }
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
    data.medications.array.forEach(() => {
      this.formService.addMedication(this.form);
    });
    medicationArray.patchValue(data.medication);
    this.form.markAsPristine();
    this.lastSaved = new Date(draft.timestamp);
  }
  toggleViewMode() {
    this.isViewMode = !this.isViewMode;
    if (this.isViewMode) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }
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
    data.medications.array.forEach(() => {
      this.formService.addMedication(this.form);
    });
    medicationArray.patchValue(data.medication);
    this.form.markAsPristine();
  }
  @HostListener('window:beforeunload', ['$event']) handleUnload(e: BeforeUnloadEvent) {
    if (this.form.dirty) {
      e.preventDefault();
    }
  }
  editMode() {
    console.log('Edit Mode: patchValue allows partial updates ');
    this.form.patchValue({
      prescribingInfo: {
        therapyType: 'Chemotherapy'
      }
    });
    console.log('Updated field:prescribingInfo.therapyType');
  }
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
    }catch(error){
      console.error('setValue Error:Missing field!',error);
    }
 }
}
