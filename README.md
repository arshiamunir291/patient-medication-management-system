Reactive Forms Concepts Implemented
1. FormArray=>Used to manage dynamic medication list
        Supports add/remove operations
        Enforces min (1) and max (10) constraints 

2. Nested FormGroups=>Deeply nested structure (3+ levels):
        patientInfo
        prescribingInfo
        medications → dosage

3. Custom Validators

    i. dosageRangeValidator
    ii. requiredDiagnosisValidator
    iii. duplicateDrugValidator

4. Dynamic Conditional Validation
    Validators change based on:
        i. therapyType
        ii. route

5. RxJS Integration
    Used for:
        Drug search
        Auto-save
        Form monitoring

6. Form State Management
    Tracks:
        dirty/pristine
        touched/untouched
        Enables/disables controls dynamically

7. Service-Based Architecture
    All form logic handled in MedicationFormService

8. Advanced Techniques
    patchValue
    setValue
    getRawValue

FormArray Implementation:
    FormArray holds multiple medication FormGroups
    Each medication is dynamically created using service
    i. Add Medication
            addMedication(form: FormGroup) {
                const medications = form.get('medications') as FormArray;
                if (medications.length < 10) {
                    const med = this.createMedicationGroup();
                    medications.push(med);
                }
            }
    ii.Remove Medication
            removeMedication(form: FormGroup, index: number) {
                const medications = form.get('medications') as FormArray;
                if (medications.length > 1) {
                    medications.removeAt(index);
                }
            }
iii. patchValue vs setValue
    patchValue=>Used when restoring draft or editing partial data
                Updates only provided fields
                form.patchValue(data);
iv. setValue=>Used when duplicating full form
                Requires all fields
                form.setValue(fullData);
                patchValue → flexibility
                setValue → strict structure validation

v. Conditional Validation
        Route-Based Validation
            IF route = 'IV':
                dosage ≥ 0.1
                instructions required (min 20 chars)
            ELSE:
                dosage ≥ 1
                instructions optional

vi. Therapy Type Validation
        IF therapyType = 'Chemotherapy':
            diagnosis required
            physician must include "Dr."
        ELSE:
            diagnosis optional
                control.valueChanges.subscribe(value => {
                    if (value === 'IV') {
                        dosage.setValidators([Validators.required, Validators.min(0.1)]);
                    } else {
                        dosage.setValidators([Validators.required, Validators.min(1)]);
                    }
                dosage.updateValueAndValidity();
                });
3: RxJS Operators Used
        Operator	            Purpose
        debounceTime(300)	    Delay drug search
        distinctUntilChanged	Prevent duplicate emissions
        startWith('')	        Initialize search
        debounceTime(5000)	    Auto-save delay
        Example:
                this.drugSearchControl.valueChanges.pipe(
                debounceTime(300),
                distinctUntilChanged(),
                startWith('')
                ).subscribe(value => {
                // filter drugs
                });
4. Auto-Save Draft Feature
    Saves form when:
        form is dirty
        form is valid
        Uses localStorage
        Debounced by 5 seconds

this.form.valueChanges.pipe(
  debounceTime(5000)
).subscribe(() => {
  if (this.form.valid && this.form.dirty) {
    localStorage.setItem('draft', JSON.stringify(this.form.getRawValue()));
  }
});
 Custom Validators
Dosage Range Validator
if (value < 0.1 || value > 5000) {
  return { dosageRange: { min: 0.1, max: 5000, actual: value } };
}
Required Diagnosis Validator
if (therapyType === 'Chemotherapy' && !diagnosis) {
  return { requiredDiagnosis: true };
}
Duplicate Drug Validator
const duplicate = names.find((drug, i) => names.indexOf(drug) !== i);
return duplicate ? { duplicateDrug: { drugName: duplicate } } : null

Form State Management

Physician disabled until therapyType selected
View-only mode disables entire form
Add button disabled when invalid
Reset Strategies
Clear All
form.reset(defaultValues);
Restore Draft
form.patchValue(savedData);
Discard Changes
form.reset(lastSavedData);
form.markAsPristine();
 getRawValue() Usage
form.value → excludes disabled controls
form.getRawValue() → includes all controls   
console.log(this.form.value);
console.log(this.form.getRawValue());
Custom Error Handling

Simulated API check:
setTimeout(() => {
  control.setErrors({
    drugExists: {}
  });
}, 2000);

Validation UI/UX
Errors shown only when:
touched && invalid
Red border for invalid fields
Green check for valid fields
Character counter for instructions

Required fields marked with *

Submit Logic:
Disabled when form invalid
Marks all fields touched on submit
Shows validation summary
Displays success message