import { AbstractControl, FormArray, ValidationErrors } from "@angular/forms";

//Dosage Range Validator
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
//diagnosed Validator
 export function requiredDiagnosisValidator(therapyTypeControl:AbstractControl):ValidationErrors | null{
    if(!therapyTypeControl.parent) return null;
    const therapyType=therapyTypeControl.value;
    const diagnosis=therapyTypeControl.parent.get('diagnosis')?.value;
    if(therapyType === "Chemotherapy" && !diagnosis){
        return {requiredDiagnosis:true};
    }
    return null;
 }
 // duplicate drug Validator
 export function duplicateDrugValidator(control:AbstractControl):ValidationErrors|null{
    const formArray=control as FormArray;
    const drugName=formArray.controls.map(c=>c.get('drugName')?.value).filter(Boolean);
    const duplicate=drugName.find((drug,index)=>drugName.indexOf(drug)!==index);
    return duplicate?{duplicateDrug:{drugName:duplicate}}:null;
 }