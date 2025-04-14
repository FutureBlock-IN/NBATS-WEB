import { Directive, Output, EventEmitter, ElementRef, AfterViewInit } from '@angular/core';
import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';

@Directive({
  selector: '[ngAutofill]',
  standalone: true,
})
export class NgAutofillDetectorDirective implements AfterViewInit {
  @Output() ngAutofill: EventEmitter<any> = new EventEmitter();

  private elRef: HTMLInputElement;

  constructor(private elementRef: ElementRef) {
    this.elRef = this.elementRef.nativeElement;
  }

  ngAfterViewInit() {
    fromEvent(this.elRef, 'change').pipe(
      filter(() => this.elRef.matches(':autofill') || this.elRef.matches(':-webkit-autofill'))
    ).subscribe(() => {
      this.ngAutofill.emit();
    });
  }
}