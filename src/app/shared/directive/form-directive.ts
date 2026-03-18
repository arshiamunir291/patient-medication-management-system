import { Directive, ElementRef, OnInit, DestroyRef, inject } from '@angular/core';
import { NgControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[appFormDirective]',
})
//driective that add red * to angular material fields
export class FormDirective implements OnInit {
  private el = inject(ElementRef<HTMLElement>);
  private ngControl = inject(NgControl, { optional: true });
  private destroyRef = inject(DestroyRef);
  ngOnInit() {
    const control = this.ngControl?.control;
    if (!control) return;
    this.updateDirtyIndicator(control.dirty);
    control.valueChanges?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.updateDirtyIndicator(control.dirty));
  }
  private updateDirtyIndicator(isDirty: boolean) {
    const field = this.el.nativeElement;
    const formField = field.closest('mat-form-field');
    if (!formField) return;
    const existing = formField.querySelector('.dirty-asterisk');

    if (isDirty && !existing) {
      const star = document.createElement('span');
      star.classList.add('dirty-asterisk');
      star.textContent = ' *';
      star.style.color = 'red';
      star.style.fontSize = '20px';

      const label = formField.querySelector('mat-label');
      label?.appendChild(star);
    }

    if (!isDirty && existing) {
      existing.remove();
    }
  }
}
