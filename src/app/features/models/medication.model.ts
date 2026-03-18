import { FormArray,FormControl,FormGroup } from "@angular/forms";
//form model that descibe the data type of evry field
export type DosageForm=FormGroup<{
    value:FormControl<number>;
    unit:FormControl<string>;
}>;
export type MedicationForm=FormGroup<{
   drugName: FormControl<string>;
   dosage:DosageForm;
   routes:FormControl<string>;
   frequency:FormControl<string>;
   instructions:FormControl<string>;
}>;
export type PatientInfoForm=FormGroup<{
    patientId:FormControl<string>;
    orderDate:FormControl<string>;
}>;
export type PrescribingInfoForm=FormGroup<{
    physicians:FormControl<string>;
    diagnosis:FormControl<string>;
    therapyType:FormControl<string>;
}>;
export type MedicationOrderFormType=FormGroup<{
    patientInfo:PatientInfoForm;
    prescribingInfo:PrescribingInfoForm;
    medications:FormArray<MedicationForm>;
}>;

