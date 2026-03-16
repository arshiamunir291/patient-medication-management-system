import { Directive,ElementRef,OnInit,Renderer2,inject } from '@angular/core';
import { NgControl } from '@angular/forms';
@Directive({
  selector: '[appFormDirective]',
})
export class FormDirective implements OnInit {

  constructor(private control:NgControl,private el:ElementRef,private renderer:Renderer2) { }

ngOnInit(): void {
  const matError=this.el.nativeElement.parentElement.queryselector('mat-error');
  if(!matError)return;
  this.control.control?.statusChanges.subscribe(()=>{
    const control=this.control.control;
    if(!control ||!(control.touched && control.invalid)){
      this.renderer.setProperty(matError,'textContent','');
      return;
    }
    const errors=control.errors;
    let message='';
    if(errors?.['required']){
      message='This field is required';
    }
    // else if(errors?.['']){}
  })

}
}
