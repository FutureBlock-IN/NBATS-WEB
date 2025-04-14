import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { UsaStatesService } from '../../../services/data-load-services/usaStates.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { LOGGING_MESSAGES } from '../../../utilities/constants/logging.constants';
import { NgAutofillDetectorDirective } from '../../../utilities/directive/ng-autofill-detector.directive';

@Component({
  selector: 'app-state-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatAutocompleteModule,
    NgAutofillDetectorDirective
  ],
  templateUrl: './state-selector.component.html',
  styleUrls: ['./state-selector.component.css']
})
export class StateSelectorComponent implements OnInit {
  @Input() selectedStateIso2: string | null = null;
  @Input() applyHeight: boolean = false;
  @Input() validator: any = Validators.required;
  @Output() stateChange = new EventEmitter<string>();
  @Output() validationStatus = new EventEmitter<boolean>();

 


  stateOptions: { name: string, iso2: string, iso3: string }[] = [];
  filteredStateOptions: { name: string, iso2: string, iso3: string }[] = [];
  selectedStateName: string | undefined;

  // Create FormControl for the input field
  stateFormControl = new FormControl<string>('', this.validator);

  constructor(private usaStatesService: UsaStatesService) { }

  ngOnInit(): void {
    this.loadStates();

    // Subscribe to form control changes to emit validation status
    this.stateFormControl.statusChanges.subscribe(() => {
      this.validationStatus.emit(this.stateFormControl.valid);
    });
  }

  loadStates(): void {
    this.usaStatesService.getStates().subscribe(
      data => {
        this.stateOptions = data;
        this.filteredStateOptions = data;
        if (this.selectedStateIso2) {
          const selectedState = this.stateOptions.find(state => state.iso2 === this.selectedStateIso2);
          this.selectedStateName = selectedState?.name;
          this.stateFormControl.setValue(this.selectedStateName || '');
        }
      },
      error => {
        console.error(LOGGING_MESSAGES.statesDataLoadError.replace('{message}', error.message));
      }
    );
  }

  onSearch(event: Event): void {
    const searchValue = (event.target as HTMLInputElement).value;
    this.filteredStateOptions = this.stateOptions.filter(state =>
      state.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      state.iso2.toLowerCase() === searchValue.toLowerCase()
    );

    // Check if the entered text matches a valid state
    const isValidState = this.stateOptions.some(state => 
      state.name.toLowerCase() === searchValue.toLowerCase() ||
      state.iso2.toLowerCase() === searchValue.toLowerCase()
    );

    if (isValidState) {
      const matchedState = this.stateOptions.find(state => 
        state.name.toLowerCase() === searchValue.toLowerCase() ||
        state.iso2.toLowerCase() === searchValue.toLowerCase()
      );
      if (matchedState) {
        this.onStateSelect(matchedState.name);
        this.stateFormControl.setErrors(null);
      }
    } else if (searchValue.length > 0) {
      // If no match found and there's input, show validation error
      this.stateFormControl.setErrors({ invalidState: true });
      this.stateFormControl.markAsTouched();
    } else {
      this.stateFormControl.setErrors(null);
    }
  }

  // onStateSelect(state: { iso2: string, name: string }): void {
  //   this.selectedStateName = state.name;
  //   this.stateChange.emit(state.iso2);
  //   this.stateFormControl.setValue(state.name);
  // }

  onStateSelect(stateName: string): void {
    const matchedState = this.stateOptions.find(state => state.name === stateName);
    if (matchedState) {
      this.selectedStateName = matchedState.name;
      this.stateChange.emit(matchedState.iso2);
      this.stateFormControl.setValue(matchedState.name); // Set value as string
    }
  }
  

  onAutofill(searchValue: string): void { 
    const matchedState = this.stateOptions.find(state => 
      state.name.toLowerCase() === searchValue.toLowerCase()
    );
  
    if (matchedState) {
      this.onStateSelect(matchedState.name);
    } 
  }
}
