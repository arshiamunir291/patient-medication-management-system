import { FormGroup } from "@angular/forms";
//checks if a form control exists,has been touched and valid
export function isValidField(form: FormGroup, controlName: string): boolean {
    const control = form.get(controlName);
    return !!(control && control.touched && control.valid);
}
//function to display different error messages
export function getErrorMessage(form: FormGroup, controlName: string): string | null {
    const control = form.get(controlName);
    if (!control || !(control.touched) || !control.errors) {
        return null;
    }
    const errors = control.errors;
    if (errors['required']) {
        return 'This field is required';
    }
    if (errors['dosageRange']) {
        return `Must between ${errors['dosageRange'].min} and ${errors['dosageRange'].max}`;
    }
    if (errors['pattern']) {
        return 'Physician name must be start with: Dr.';
    }
    if (errors['minlength']) {
        return `Minimum ${errors['minlength'].requiredLength} characters required`;
    }
    if(errors['min']){
        return `Value must be at least ${errors['min'].min}`
    }
    if (errors['drugExists']) {
        return `Drug ${errors['drugExists'].name} already exists(ID:${errors['drugExists'].id})`;
    }
    return 'Invalid field';
}