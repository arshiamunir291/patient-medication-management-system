import { AbstractControl, ValidationErrors } from "@angular/forms";


export function dosageRangeValidator(control:AbstractControl):ValidationErrors|null{
    const value=control.value;
    if(value == null) return null;
    if(value<0.1 || value>5000){
        return{
            dosageRange:{
                min:0.1,
                max:5000,
                actual:value
            }
        }
    }
    return null;
};
 export function requiredDiagnosisValidator(therapyTypeControl:AbstractControl):ValidationErrors | null{
    if(!therapyTypeControl.parent) return null;
    const therapyType=therapyTypeControl.value;
    const diagnosis=therapyTypeControl.parent.get('diagnosis')?.value;
    if(therapyType === "Chemotherapy" && !diagnosis){
        return {requiredDiagnosis:true};
    }
    return null;
 }