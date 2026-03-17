import { FormGroup } from "@angular/forms";
export function isValidField(form:FormGroup,controlName:string):boolean{
    const control=form.get(controlName);
    return !!(control && control.touched && control.valid);
}
export function getErrorMessage(form:FormGroup,controlName:string):string|null{
    const control=form.get(controlName);
    if(!control || !(control.touched)|| !control.errors){
        return null;
    }
    const errors=control.errors;
    if(errors['required']){
        return 'This field is required';
    }
    if(errors['minlength']){
        return `Minimum ${errors['minlength'].requiredLength} characters required`;
    }
    if(errors['dosageRange']){
        return `Must between ${errors['dosageRange'].min} and ${errors['dosageRange'].max}`;
    }
    if(errors['drugExists']){
        return `Drug ${errors['drugExists'].name} already exists(ID:${errors['drugExists'].id})`;
    }
    return 'Invalid field';
}