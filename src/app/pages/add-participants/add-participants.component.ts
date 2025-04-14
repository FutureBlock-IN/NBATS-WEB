import { Component, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, viewChild, TemplateRef } from '@angular/core';
import { OrganizationUserService } from '../../services/api-services/organizationUser.service';
import { UploadService } from '../../services/api-services/uploadFile.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NotificationPopupComponent } from '../../components/shared-comps/notification-popup/notification-popup.component';
import { baseUser } from '../../models/serviceModels/user/baseUser';
import { CommonModule } from '@angular/common';
import { CircularStepperComponent } from '../../components/shared-comps/circular-stepper/circular-stepper.component';
import { StepperComponentComponent } from "../../components/shared-comps/stepper-component/stepper-component.component";
import { Location } from '@angular/common';
import { CustomValidators } from '../../utilities/validators/custom-validators';
import { UsaStatesService } from '../../services/data-load-services/usaStates.service';
import { StateSelectorComponent } from '../../components/shared-comps/state-selector/state-selector.component';
import { VALIDATION_MESSAGES } from '../../utilities/constants/validation-strings';
import { PhoneNumberValidator } from '../../utilities/validators/phone-number-validator';
import { UserRole } from '../../utilities/enums/user-roles.enums';
import { ERROR_MESSAGES } from '../../utilities/constants/error-messages.constants';
import { LOGGING_MESSAGES } from '../../utilities/constants/logging.constants';
import { ResponseEventDTO } from '../../models/serviceModels/event/responseEvent';
import { EventUserService } from '../../services/api-services/eventUser.service';
import { ItemSelectorComponent } from '../../components/shared-comps/item-selector/item-selector.component'; 
import { EventService } from '../../services/api-services/event.service';
import { Router } from '@angular/router';
import { forkJoin, Observable, of, switchMap, throwError } from 'rxjs';
import { AppConstants } from '../../app-Constants/app.constants';

@Component({
  selector: 'app-add-participants',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    CommonModule,
    CircularStepperComponent,
    StepperComponentComponent,
    StateSelectorComponent,
    StateSelectorComponent,
    ItemSelectorComponent
  ],
  templateUrl: './add-participants.component.html',
  styleUrls: ['./add-participants.component.css']
})
export class AddParticipantsComponent implements AfterViewInit {
  @ViewChild('participantTemplate') participantTemplate!:TemplateRef<any>;
  @ViewChild('ageVerificationTemplate') ageVerificationTemplate!:TemplateRef<any>;
  @ViewChild('eventTemplate') eventTemplate!: TemplateRef<any>;
  @ViewChild(CircularStepperComponent) stepper!: CircularStepperComponent;
  @ViewChild('fileUpload') fileUpload!: ElementRef;


  enterDetailsForm: FormGroup;
  firstGuardianForm: FormGroup;
  secondGuardianForm: FormGroup;
  eventForm: FormGroup;
  showSecondGuardian: boolean = false;
  isUnder14: boolean = false;
  isUnder14Temp: boolean = false;
  isFirstGuardianAdded: boolean = false;
  isFormEditable: boolean = true;
  savedParticipantData?: baseUser & { id: number };
  savedGuardianData?: baseUser & { id: number };
  errorMessage: string | null = null;
  selectedFileName: string | undefined;
  selectedFile: File | null = null;
  fileErrorMessage: string | undefined;
  steps: Array<{ label: string; formGroup: FormGroup; content: TemplateRef<any>; isCompleted: boolean }> = [];
  stateOptions: { name: string, iso2: string, iso3: string }[] = [];
  filteredStateOptions: { name: string, iso2: string, iso3: string }[] = [];
  selectedStateName: string | undefined;
  events: ResponseEventDTO[] = [];
  isLoadingEvents = true;
  eventIds: number[] = [];
  validationMessages = VALIDATION_MESSAGES;
  isParticipantsCreating = false ; 

  constructor(
    private userService: OrganizationUserService,
    private uploadService: UploadService,
    private dialog: MatDialog,
    private router: Router,
    private appConstants: AppConstants,

    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private location:Location,
    private usaStatesService: UsaStatesService,
    private eventUserService: EventUserService,
    private eventService: EventService
  ) {

    this.eventForm = new FormGroup({
      staff: new FormControl(''),
      participants: new FormControl(''),
    });

    this.enterDetailsForm = this.fb.group({
      firstName: ['', CustomValidators.nameValidator()],
      lastName: ['', CustomValidators.nameValidator()],
      email: ['', [CustomValidators.emailValidator()]],
      phone: ['', [Validators.required, PhoneNumberValidator.validPhoneNumber()]],
      address: ['', CustomValidators.addressValidator()],
      city: ['', CustomValidators.nameValidator()],
      state: [null, CustomValidators.nameValidator()],
      zip: ['', CustomValidators.zipValidator()],
    });

    // Initially define the form without the validators
this.firstGuardianForm = this.fb.group({
  guardianFirstName: [''],
  guardianLastName: [''],
  guardianEmail: [''],
  guardianPhone: ['']
});

this.secondGuardianForm = this.fb.group({
  guardianFirstName: [''],
  guardianLastName: [''],
  guardianEmail: [''],
  guardianPhone: ['']
});

  }


  onEventSelect(eventId: number): void {
    console.log('Selected event:', eventId);

    if (eventId && !this.eventIds.includes(eventId)) {
      this.eventIds.push(eventId);
    }
    else if(this.eventIds.includes(eventId)){
      this.eventIds = this.eventIds.filter(id => id !== eventId);
    }
  }

  assignUserToEvents(userId: number): Observable<any> {
    if (this.eventIds && this.eventIds.length > 0) {
      const eventAssignments$ = this.eventIds.map(eventId =>
        this.eventUserService.assignUser(eventId, userId)
      );
      return forkJoin(eventAssignments$);
    }
    return of(null);
  }

// Function to update validators based on the isUnder14 flag
updateFirstGuardianValidators(isUnder14: boolean) {
  if (isUnder14) {
    this.firstGuardianForm.get('guardianFirstName')?.setValidators([Validators.required,CustomValidators.nameValidator()]);
    this.firstGuardianForm.get('guardianLastName')?.setValidators([Validators.required,CustomValidators.nameValidator()]);
    this.firstGuardianForm.get('guardianEmail')?.setValidators([Validators.required,CustomValidators.emailValidator()]);
    this.firstGuardianForm.get('guardianPhone')?.setValidators([Validators.required, PhoneNumberValidator.validPhoneNumber()]);
  } else {
    this.firstGuardianForm.get('guardianFirstName')?.clearValidators();
    this.firstGuardianForm.get('guardianLastName')?.clearValidators();
    this.firstGuardianForm.get('guardianEmail')?.clearValidators();
    this.firstGuardianForm.get('guardianPhone')?.clearValidators();
  }
  // Update the validity status of the form controls
  this.firstGuardianForm.get('guardianFirstName')?.updateValueAndValidity();
  this.firstGuardianForm.get('guardianLastName')?.updateValueAndValidity();
  this.firstGuardianForm.get('guardianEmail')?.updateValueAndValidity();
  this.firstGuardianForm.get('guardianPhone')?.updateValueAndValidity();
}

updateSecondGuardianValidators(showSecondGuardian: boolean) {
  if (showSecondGuardian) {
    this.secondGuardianForm.get('guardianFirstName')?.setValidators([Validators.required, CustomValidators.nameValidator()]);
      this.secondGuardianForm.get('guardianLastName')?.setValidators([Validators.required, CustomValidators.nameValidator()]);
      this.secondGuardianForm.get('guardianEmail')?.setValidators([Validators.required, CustomValidators.emailValidator()]);
      this.secondGuardianForm.get('guardianPhone')?.setValidators([Validators.required, PhoneNumberValidator.validPhoneNumber()]);
  } else {
    this.secondGuardianForm.get('guardianFirstName')?.clearValidators();
    this.secondGuardianForm.get('guardianLastName')?.clearValidators();
    this.secondGuardianForm.get('guardianEmail')?.clearValidators();
    this.secondGuardianForm.get('guardianPhone')?.clearValidators();
  }
  this.secondGuardianForm.get('guardianFirstName')?.updateValueAndValidity();
  this.secondGuardianForm.get('guardianLastName')?.updateValueAndValidity();
  this.secondGuardianForm.get('guardianEmail')?.updateValueAndValidity();
  this.secondGuardianForm.get('guardianPhone')?.updateValueAndValidity();
}

  ngAfterViewInit(): void {
    this.steps = [
      { label: 'Enter Details', formGroup: this.enterDetailsForm, content: this.participantTemplate, isCompleted: false },
      { label: 'Age Verification', formGroup: this.firstGuardianForm, content: this.ageVerificationTemplate, isCompleted: false },
      { label: 'Add Events', formGroup: this.eventForm, content: this.eventTemplate, isCompleted: false },
    ];
    this.cdr.detectChanges();
    this.updateFormEditability();
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFileName = file.name;
      this.selectedFile = file;
      const fileType = file.type;
      const fileSize = file.size;

      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validImageTypes.includes(fileType)) {
        this.fileErrorMessage = ERROR_MESSAGES.fileTypeUnsupported;
        this.selectedFileName = undefined;
        this.selectedFile = null;
        return;
      }

      const maxSizeInMB = 3;
      if (fileSize > maxSizeInMB * 1024 * 1024) {
        this.fileErrorMessage = ERROR_MESSAGES.fileSizeExceeded;
        this.selectedFileName = undefined;
        this.selectedFile = null;
        return;
      }

      this.fileErrorMessage = undefined;
      this.selectedFileName = file.name;
      this.selectedFile = file;
    }
  }
  backNavigate(){
    if(!this.isUnder14){
      this.location.back();
    }
  }
  onSubmitParticipant(){
    if(this.enterDetailsForm.valid){
      this.moveTONextStep();
    }
  }

  createUser(userData: baseUser, logoUrl?: string): void {
    if (logoUrl) {
      userData.logoUrl = logoUrl;
    }
  
    this.userService.createUser(userData).pipe(
      switchMap((response: any) => {
        this.savedParticipantData = { ...userData, id: response.id };
        
        let guardianCreation$ = of(null);
        if (this.isUnder14 && !this.isUnder14Temp) {
          this.isUnder14 = true;
          guardianCreation$ = this.createGuardian();
        }
        
        return forkJoin({
          guardian: guardianCreation$,
          eventAssignments: this.assignUserToEvents(this.savedParticipantData?.id || 0),
        });
      })
    ).subscribe({
      next: () => {
        this.router.navigateByUrl(`${this.appConstants.participantsTabRoute}`);
        this.showNotification('Success', `${this.appConstants.participantCreatedSuccessfully}`, 'ok');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showNotification('Error', `${err.message}`, 'ok');
        this.isParticipantsCreating = false;
      }
    });
  }

  createGuardian(): Observable<any> {
    const guardianFormValue = this.firstGuardianForm.value;
    const guardianData: baseUser = {
      firstName: guardianFormValue.guardianFirstName,
      lastName: guardianFormValue.guardianLastName,
      email: guardianFormValue.guardianEmail,
      phone: guardianFormValue.guardianPhone,
      state: guardianFormValue.state,
      externalUserId: guardianFormValue.guardianEmail,
      role: UserRole.Guardian,
      minor: false,
      logoUrl: undefined,
    };
  
    return this.userService.createUser(guardianData).pipe(
      switchMap((response: any) => {
        this.savedGuardianData = { ...guardianData, id: response.id };
  
        if (this.savedParticipantData && this.savedParticipantData.id) {
          return this.createUserGuardian(this.savedParticipantData.id, this.savedGuardianData.id).pipe(
            switchMap(() => {
              if (this.showSecondGuardian && this.secondGuardianForm.valid) {
                return this.createSecondGuardian();
              } else {
                return of(null);
              }
            })
          );
        } else {
          return throwError(() => new Error(`${this.appConstants.participantDataIsUndefined}`));
        }
      })
    );
  }

  createSecondGuardian(): Observable<any> {
    const formValue = this.secondGuardianForm.value;
    const secondGuardianData: baseUser = {
      firstName: formValue.guardianFirstName,
      lastName: formValue.guardianLastName,
      email: formValue.guardianEmail,
      phone: formValue.guardianPhone,
      address: null,
      state: formValue.state,
      city: null,
      zip: null,
      externalUserId: formValue.guardianEmail,
      role: UserRole.Guardian,
      minor: false,
      logoUrl: undefined,
    };
  
    return this.userService.createUser(secondGuardianData).pipe(
      switchMap((response: any) => {
        const secondGuardianId = response.id;
  
        if (this.savedParticipantData && this.savedParticipantData.id) {
          return this.createUserGuardian(this.savedParticipantData.id, secondGuardianId);
        } else {
          return throwError(() => new Error(`${this.appConstants.participantDataIsUndefined}`));
        }
      })
    );
  }
  

  ngOnInit(): void {
    this.loadStates();
    this.loadEvents();
  }

  
  loadEvents(): void {
    this.eventService.getEventsByOwnerID().subscribe({
      next: (events) => {
        this.events = events;
        this.isLoadingEvents = false;
      },
      error: (err) => {
        console.error('Error loading events', err);
        this.isLoadingEvents = false;
      }
    });
  }

  loadStates(): void {
    this.usaStatesService.getStates().subscribe(
      data => {
        this.stateOptions = data;
        this.filteredStateOptions = data;
      },
      error => {
        console.error(LOGGING_MESSAGES.statesDataLoadError.replace('{message}', error.message));
      }
    );
  }

  onSubmitGuardian(){

    if(this.fileErrorMessage){
      return;
    }

    if (this.isUnder14 && this.firstGuardianForm.invalid) {
      return;
   }
 
   if (this.showSecondGuardian && this.secondGuardianForm.invalid) {
      return;
   }
  }



  usersCreationAndAttachToEvents(){
    
    this.isParticipantsCreating = true ;
    const participantFormValue = this.enterDetailsForm.value;
    const participantData: baseUser = {
      firstName: participantFormValue.firstName,
      lastName: participantFormValue.lastName,
      email: participantFormValue.email,
      phone: participantFormValue.phone,
      address: participantFormValue.address,
      city: participantFormValue.city,
      zip: participantFormValue.zip,
      state: participantFormValue.state,
      externalUserId: participantFormValue.email,
      role: UserRole.Participant,
      minor: this.isUnder14,
      logoUrl: this.selectedFile ? undefined : participantFormValue.logoUrl,
    }

    if (this.selectedFile) {
      const containerName = 'organization-user-logos';
      this.uploadService.uploadImage(containerName, this.selectedFile).subscribe({
        next: (logoUrl: string) => {
          this.createUser(participantData, logoUrl);
        },
        error: (err) => {
          this.showNotification('Error', ERROR_MESSAGES.imageUploadFailed.replace('{message}', err.message), 'ok');
          this.isParticipantsCreating = false ;
        }
      });
    } else {
      this.createUser(participantData);
    }
  }

  createUserGuardian(participantId: number, guardianId: number): Observable<any> {
    return this.userService.createChildGuardian(participantId, guardianId).pipe(
      switchMap(() => this.assignUserToEvents(guardianId))
    );
  }

  toggleSecondGuardian() {
    if (this.firstGuardianForm.valid) {
      this.showSecondGuardian = !this.showSecondGuardian;
      this.updateSecondGuardianValidators(this.showSecondGuardian);
    }
  }
  
  onUnder14Selected(): void{
    this.updateFormEditability();
  }

  updateFormEditability(): void {
    if (this.isUnder14) {
      this.firstGuardianForm.enable();
    }
  }

  onUnder14Toggle(value: boolean): void {
    if (!this.isFirstGuardianAdded) {
      this.isUnder14 = value;
      this.updateFirstGuardianValidators(value);
      this.updateSecondGuardianValidators(false);
      if (!value) {
        this.clearGuardianForms();
      }
    }
  }

  clearGuardianForms(): void {
    // Reset first guardian form
    this.firstGuardianForm.reset({
      guardianFirstName: '',
      guardianLastName: '',
      guardianEmail: '',
      guardianPhone: ''
    });

    // Reset second guardian form
    this.secondGuardianForm.reset({
      guardianFirstName: '',
      guardianLastName: '',
      guardianEmail: '',
      guardianPhone: ''
    });

    // Reset second guardian visibility
    this.showSecondGuardian = false;
  }

  onStateChange(stateIso2: string): void {
    const selectedState = this.stateOptions.find(state => state.iso2 === stateIso2);
    if (selectedState) {
      this.selectedStateName = selectedState.name;
      this.enterDetailsForm.patchValue({ state: stateIso2 });
    }
  }

  showNotification(title: string, message: string, buttonName: string): void {
    this.dialog.open(NotificationPopupComponent, {
      data: {
        title,
        message,
        buttonName
      }
    });
  }

  markAllAsTouched() {
    // Mark all form controls in the event form as touched to trigger validation messages
    Object.values(this.enterDetailsForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }


  goPreviousForm(){
    this.stepper.goToPreviousStep();
  }

  markFirstGuardianAsTouched() {
    Object.values(this.firstGuardianForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  markSecondGuardianAsTouched() {
    Object.keys(this.secondGuardianForm.controls).forEach(controlName => {
      const control = this.secondGuardianForm.get(controlName);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  markGuardiansAsTouched(){
    this.markFirstGuardianAsTouched();
    if (this.firstGuardianForm.valid || this.firstGuardianForm.disabled){
      Object.values(this.firstGuardianForm.controls).forEach(control => {
        control.markAsTouched();
      });  
    }

    const email = this.enterDetailsForm.value.email?.toLowerCase() || '';
    const firstGuardianEmail = this.firstGuardianForm.value.guardianEmail?.toLowerCase() || '';
    const secondGuardianEmail = this.secondGuardianForm.value.guardianEmail?.toLowerCase() || '';

    if (email === firstGuardianEmail || (this.showSecondGuardian && email === secondGuardianEmail)) {
      this.showNotification('Error', this.validationMessages.participantAndGuardianEmailsMatchError.cannotMatch, 'ok');
      return;
    }

    if (this.showSecondGuardian && firstGuardianEmail === secondGuardianEmail) {
      this.showNotification('Error', this.validationMessages.guardianEmailsMatchedError.cannotMatch, 'ok');
      return;
    }

    this.moveTONextStep();
  }

  moveTONextStep(){
    this.stepper.goToNextStep();
    this.steps[this.stepper.selectedIndex].isCompleted = true;
  }
}
