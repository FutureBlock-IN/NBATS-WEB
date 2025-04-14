import { CdkStepper } from '@angular/cdk/stepper';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-stepper-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stepper-component.component.html',
  styleUrl: './stepper-component.component.css',
  providers:[{provide:CdkStepper,useExisting:StepperComponentComponent}]
})
export class StepperComponentComponent extends CdkStepper {
  @Input() LinearModeSelected = true
  onClick(index:number){
    this.selectedIndex = index;
  }

}
