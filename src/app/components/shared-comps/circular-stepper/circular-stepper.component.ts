import { AfterViewInit, Component, Input, ViewChild, ElementRef, Renderer2, ChangeDetectorRef } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-circular-stepper',
  standalone: true,
  imports: [
    MatStepperModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './circular-stepper.component.html',
  styleUrls: ['./circular-stepper.component.css']
})
export class CircularStepperComponent implements AfterViewInit {
  @Input() steps: { label: string, formGroup: FormGroup, content: any, isCompleted: boolean }[] = [];
  @Input() isLinear: boolean = true;
  @Input() selectedIndex: number = 0;
  @Input() isEditable: boolean = false;
  @Input() stepsLength:number = 0;

  @ViewChild('stepper', { static: false }) stepper!: MatStepper;

  constructor(private renderer: Renderer2, private elRef: ElementRef, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    const headerContainer = this.elRef.nativeElement.querySelector('.mat-horizontal-stepper-header-container');

    if (headerContainer && this.stepsLength < 3) {
      this.renderer.addClass(headerContainer, 'two-steps-padding');
    }
  }

  goToNextStep(): void {
    if (this.stepper) {
      this.completeCurrentStep();
      this.stepper.next();
    }
  }

  async goToPreviousStep(): Promise<void> {
    await this.mutateFormProps();
    this.cdr.detectChanges(); // Manually trigger change detection
    this.stepper.previous();  // Navigate to the previous step
    await this.mutateFormProps();
  }

  mutateFormProps(): Promise<void> {
    return new Promise((resolve) => {
      this.isLinear = !this.isLinear;
      this.isEditable = !this.isLinear;
      resolve(); // Resolve the promise after mutation
    });
  }

  

  goToStep(index: number): void {
    if (this.stepper) {
      this.stepper.selectedIndex = index;
    }
  }

  completeCurrentStep(): void {
    const currentStep = this.steps[this.stepper.selectedIndex];
    if (currentStep && currentStep.formGroup.valid) {
      currentStep.isCompleted = true;
    }
  }
  onStepClick(index: number): void {
    if (this.selectedIndex !== index) {
      this.selectedIndex = index;
    }
  }
}