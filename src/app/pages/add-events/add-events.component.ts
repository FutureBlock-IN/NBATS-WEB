import { AfterViewInit, ChangeDetectorRef, Component, TemplateRef, ViewChild, ElementRef, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormsModule, ValidatorFn, AbstractControl, ValidationErrors, FormBuilder } from '@angular/forms';
import { EventService } from '../../services/api-services/event.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { createEventDTO } from '../../models/serviceModels/event/createEvent';
import { CircularStepperComponent } from '../../components/shared-comps/circular-stepper/circular-stepper.component';
import { StepperComponentComponent } from '../../components/shared-comps/stepper-component/stepper-component.component';
import { ItemSelectorComponent } from '../../components/shared-comps/item-selector/item-selector.component';
import { UploadService } from '../../services/api-services/uploadFile.service';
import { MatDialog } from '@angular/material/dialog';
import { NotificationPopupComponent } from '../../components/shared-comps/notification-popup/notification-popup.component';
import { endDateValidator, startDateValidator } from '../../services/validators/datesValidator';
import { PostEventScheduleConfigDTO } from '../../models/serviceModels/event/baseEventSchedule';
import { OrganizationUserService } from '../../services/api-services/organizationUser.service';
import { AppConstants } from '../../app-Constants/app.constants';
import { ResponseUserDTO } from '../../models/serviceModels/user/responseUser';
import { VALIDATION_MESSAGES } from '../../utilities/constants/validation-strings';
import { EventUserService } from '../../services/api-services/eventUser.service';
import { validWeekdaysValidator } from '../../utilities/validators/weekdays-validator';
import { timeGreaterThanCurrentTimeValidator } from '../../utilities/validators/time-validator';

@Component({
  selector: 'app-add-events',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    CircularStepperComponent,
    StepperComponentComponent,
    CalendarModule,
    DropdownModule,
    MatIconModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    ItemSelectorComponent
  ],
  templateUrl: './add-events.component.html',
  styleUrls: ['./add-events.component.css'],
})
export class AddEventsComponent implements AfterViewInit, OnInit {
  @ViewChild('eventTemplate') eventTemplate!: TemplateRef<any>;
  @ViewChild('scheduleTemplate') scheduleTemplate!: TemplateRef<any>;
  @ViewChild('participantsTemplate') participantsTemplate!: TemplateRef<any>;
  @ViewChild(CircularStepperComponent) stepper!: CircularStepperComponent;
  @ViewChild('fileUpload') fileUpload!: ElementRef;

  eventForm: FormGroup;
  scheduleForm: FormGroup;
  participantsForm: FormGroup;
  selectedFileName: string | undefined;
  selectedFile: File | null = null;
  fileErrorMessage: string | undefined;
  createdEventId!: number;
  steps: Array<{
    label: string;
    formGroup: FormGroup;
    content: TemplateRef<any>;
    isCompleted: boolean;
  }> = [];
  isEventDTOLoading: boolean = false;
  isEventDTOCreated: boolean = false;
  isEventScheduleDtoLoading: boolean = false;
  createEventDTO!: createEventDTO;
  createEventScheduleDTO!: PostEventScheduleConfigDTO;
  selectedHour: number | null = null;
  canGoBacktoFirstStep: boolean | null = null;
  hours: { label: string; value: number }[] = Array.from(
    { length: 8 },
    (_, i) => ({
      label: `${i + 1} Hour${i + 1 > 1 ? 's' : ''}`,
      value: i + 1,
    })
  );
  timeSlots: { label: string; value: string }[] = Array.from(
    { length: 48 },
    (_, i) => {
      const hours = Math.floor(i / 2);
      const minutes = i % 2 === 0 ? '00' : '30';
      const period = hours < 12 ? 'AM' : 'PM';
      const hourLabel = hours % 12 === 0 ? 12 : hours % 12;
      return {
        label: `${hourLabel}:${minutes} ${period}`,
        value: `${hours.toString().padStart(2, '0')}:${minutes}`,
      };
    }
  );
  staff: ResponseUserDTO[] = [];
  participants: ResponseUserDTO[] = [];
  defaultImageUrl: string = '../../../assets/images/userPlaceholder.jpg';
  validationMessages = VALIDATION_MESSAGES;
  isLoadingStaff = false;
  isEventCreating = false;

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const eventData = JSON.parse(params['event']);
      this.eventForm.patchValue(eventData);
      this.eventForm.get('location')?.patchValue(eventData.locationNotes);
      this.eventForm.get('checkType')?.patchValue(eventData.type);
      this.eventForm.get('statusType')?.patchValue(eventData.status);
    });
    setTimeout(() => {
      if (this.stepper && this.stepper.stepper) {
        this.stepper.stepper.selectionChange.subscribe((event) => {
          if (event.selectedIndex === 2) {
            this.getStaffAndParticipants();
          }
        });
      }
    });
  }
  ngAfterViewInit() {
    this.steps = [
      {
        label: 'Event Information',
        formGroup: this.eventForm,
        content: this.eventTemplate,
        isCompleted: false,
      },
      {
        label: 'Setup Scheduling',
        formGroup: this.scheduleForm,
        content: this.scheduleTemplate,
        isCompleted: false,
      },
      {
        label: 'Assign staff and paticipants.',
        formGroup: this.participantsForm,
        content: this.participantsTemplate,
        isCompleted: false,
      },
    ];
    this.cdr.detectChanges();
  }

  constructor(
    private route: ActivatedRoute,
    private eventApi: EventService,
    private cdr: ChangeDetectorRef,
    private uploadService: UploadService,
    private dialog: MatDialog,
    private organizationUserService: OrganizationUserService,
    private appConstants: AppConstants,
    private router: Router,
    private eventUserService: EventUserService
  ) {
    this.eventForm = new FormGroup({
      title: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
      ]),
      description: new FormControl('', [Validators.required]),
      location: new FormControl('', Validators.required),
      checkType: new FormControl('Check_in', Validators.required),
      statusType: new FormControl('Active', Validators.required),
    });
    this.scheduleForm = new FormGroup(
      {
        startDate: new FormControl('', [
          Validators.required,
          startDateValidator(),
        ]),
        startTime: new FormControl('08:00', [Validators.required]),
        endDate: new FormControl('', Validators.required),
        duration: new FormControl(1, Validators.required),
        isRecurring: new FormControl(false),
        repeat: new FormControl(''),
        weekdays: new FormGroup({
          mon: new FormControl(false),
          tue: new FormControl(false),
          wed: new FormControl(false),
          thu: new FormControl(false),
          fri: new FormControl(false),
          sat: new FormControl(false),
          sun: new FormControl(false),
        }),
      },
      { validators: validWeekdaysValidator('startDate', 'endDate', 'weekdays') }
    );

    this.scheduleForm
      .get('startTime')
      ?.setValidators([
        Validators.required,
        timeGreaterThanCurrentTimeValidator(
          this.scheduleForm.get('startDate')!
        ),
      ]);

    this.scheduleForm.get('startDate')?.valueChanges.subscribe(() => {
      this.scheduleForm.get('startTime')?.updateValueAndValidity();
    });

    this.scheduleForm.get('startTime')?.updateValueAndValidity();

    console.log(this.scheduleForm.errors);
    // Initialize validators based on the initial isRecurring value
    this.updateValidators(this.scheduleForm.get('isRecurring')?.value);

    const startDateControl = this.scheduleForm.get('startDate');
    const endDateControl = this.scheduleForm.get('endDate');
    endDateControl?.setValidators([
      Validators.required,
      endDateValidator(startDateControl),
    ]);

    startDateControl?.valueChanges.subscribe(() => {
      endDateControl?.updateValueAndValidity();
    });

    this.scheduleForm
      .get('isRecurring')
      ?.valueChanges.subscribe((isRecurring) => {
        this.updateValidators(isRecurring);
      });

    this.scheduleForm.get('repeat')?.valueChanges.subscribe((repeatValue) => {
      if (repeatValue === 'Daily') {
        this.selectAllWeekdays();
      } else if (repeatValue === 'Weekly') {
        this.deselectAllWeekdays();
      }
    });

    const weekdaysControl = this.scheduleForm.get('weekdays') as FormGroup;
    Object.keys(weekdaysControl.controls).forEach((day) => {
      weekdaysControl.get(day)?.valueChanges.subscribe(() => {
        this.onWeekdayChange();
      });
    });

    this.participantsForm = new FormGroup({
      staff: new FormControl(''),
      participants: new FormControl(''),
    });
  }
  selectAllWeekdays() {
    const weekdaysControl = this.scheduleForm.get('weekdays') as FormGroup;
    weekdaysControl.patchValue(
      {
        mon: true,
        tue: true,
        wed: true,
        thu: true,
        fri: true,
        sat: true,
        sun: true,
      },
      { emitEvent: false }
    );

    // Ensure the 'Daily' option is selected
    this.scheduleForm.get('repeat')?.setValue('Daily', { emitEvent: false });
  }
  deselectAllWeekdays() {
    const weekdaysControl = this.scheduleForm.get('weekdays') as FormGroup;
    Object.keys(weekdaysControl.controls).forEach((day) => {
      weekdaysControl.get(day)?.setValue(false, { emitEvent: false });
    });
  }
  onWeekdayChange() {
    const weekdaysControl = this.scheduleForm.get('weekdays') as FormGroup;
    const weekdaysValues = weekdaysControl.value;
    const allSelected = Object.values(weekdaysValues).every(
      (value) => value === true
    );
    const anyDeselected = Object.values(weekdaysValues).some(
      (value) => value === false
    );

    if (allSelected) {
      // If all weekdays are selected, set 'repeat' to 'Daily'
      this.scheduleForm.get('repeat')?.setValue('Daily', { emitEvent: false });
    } else if (anyDeselected) {
      // If any weekday is deselected, set 'repeat' to 'Weekly'
      this.scheduleForm.get('repeat')?.setValue('Weekly', { emitEvent: false });
    }
  }
  updateValidators(isRecurring: boolean) {
    const endDateControl = this.scheduleForm.get('endDate');
    const repeatControl = this.scheduleForm.get('repeat');
    const weekdaysControl = this.scheduleForm.get('weekdays');

    if (isRecurring) {
      // Apply the validators when isRecurring is true
      endDateControl?.setValidators([
        Validators.required,
        endDateValidator(this.scheduleForm.get('startDate')),
      ]);
      endDateControl?.enable(); // Ensure the control is enabled
      repeatControl?.setValidators([Validators.required]);
      weekdaysControl?.setValidators([this.atLeastOneWeekdayValidator()]);
    } else {
      // Clear validators when isRecurring is false
      endDateControl?.clearValidators();
      endDateControl?.disable(); // Disable the control
      repeatControl?.clearValidators();
      weekdaysControl?.clearValidators();

      // Optionally clear values if not recurring
      this.scheduleForm.patchValue({
        endDate: '',
        repeat: '',
        weekdays: {
          mon: false,
          tue: false,
          wed: false,
          thu: false,
          fri: false,
          sat: false,
          sun: false,
        },
      });
    }

    // Update the validity of the controls after adding/removing validators
    endDateControl?.updateValueAndValidity();
    repeatControl?.updateValueAndValidity();
    weekdaysControl?.updateValueAndValidity();
  }

  atLeastOneWeekdayValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const weekdays = group.value;
      const isAtLeastOneSelected = Object.values(weekdays).some(
        (value) => value === true
      );
      return isAtLeastOneSelected ? null : { atLeastOneRequired: true };
    };
  }
  isRecurringSelected(): boolean {
    return this.scheduleForm.get('isRecurring')?.value === true;
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFileName = file.name;
      this.selectedFile = file;
      const fileType = file.type;
      const fileSize = file.size

      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validImageTypes.includes(fileType)) {
        this.fileErrorMessage = 'Unsupported file type. Only JPEG, JPG, and PNG are allowed.';
        this.selectedFileName = undefined;
        this.selectedFile = null;
        return;
      }

      const maxSizeInMB = 3;
      if (fileSize > maxSizeInMB * 1024 * 1024) {
        this.fileErrorMessage = 'File size exceeds the 3 MB limit.';
        this.selectedFileName = undefined;
        this.selectedFile = null;
        return;
      }

      this.fileErrorMessage = undefined;
      this.selectedFileName = file.name;
      this.selectedFile = file;
    }
  }

  combineDateAndTime(
    date: string,
    time: string,
    duration: string
  ): { startTime: string; endTime: string } {
    if (!date || !time || !duration) {
      throw new Error('Invalid date, time, or duration value');
    }

    const [timeString, period] = time.split(' ');
    let [hours, minutes] = timeString.split(':').map(Number);

    if (period === 'PM' && hours !== 12) {
      hours += 12;
    }
    if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    const combinedDate = new Date(date);
    combinedDate.setHours(hours, minutes, 0, 0);

    const durationInMinutes = parseInt(duration) * 60; // Assuming duration is in hours
    let endDate: Date;

    if (this.scheduleForm.get('isRecurring')?.value) {
      const formEndDate = this.scheduleForm.get('endDate')?.value;
      endDate = new Date(formEndDate);
      endDate.setHours(hours, minutes, 0, 0);
      endDate = new Date(endDate.getTime() + durationInMinutes * 60 * 1000);
    } else {
      endDate = new Date(
        combinedDate.getTime() + durationInMinutes * 60 * 1000
      );
    }

    // Convert to ISO string format (UTC) and return the result
    return {
      startTime: combinedDate.toISOString(), // ISO format: 2024-09-13T19:00:00.000Z
      endTime: endDate.toISOString(), // ISO format: 2024-09-13T20:00:00.000Z
    };
  }

  getSelectedWeekdays(): string {
    const weekdaysObject = this.scheduleForm.get('weekdays')?.value;
    const selectedWeekdays: string[] = [];

    if (weekdaysObject.mon) selectedWeekdays.push('Mon');
    if (weekdaysObject.tue) selectedWeekdays.push('Tue');
    if (weekdaysObject.wed) selectedWeekdays.push('Wed');
    if (weekdaysObject.thu) selectedWeekdays.push('Thu');
    if (weekdaysObject.fri) selectedWeekdays.push('Fri');
    if (weekdaysObject.sat) selectedWeekdays.push('Sat');
    if (weekdaysObject.sun) selectedWeekdays.push('Sun');

    return selectedWeekdays.join(',');
  }
  getTruncatedName(firstName: string, lastName: string): string {
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const nameWords = fullName.split(' ').filter((word) => word);

    if (nameWords.length > 2) {
      return `${nameWords.slice(0, 2).join(' ')}...`;
    }

    return fullName;
  }
  showNotification(title: string, message: string, buttonName: string): void {
    this.dialog.open(NotificationPopupComponent, {
      data: {
        title,
        message,
        buttonName,
      },
    });
  }
  markAllAsTouchedSchedule() {
    this.scheduleForm.markAllAsTouched();
  }
  markAllAsTouched() {
    // Mark all form controls in the event form as touched to trigger validation messages
    Object.values(this.eventForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }
  NoParticipants: boolean = false;
  NoStaff: boolean = false;
  isStaffListLoading: boolean = false;
  isParticipantListLoading: boolean = false;

  getStaffAndParticipants() {
    // Only set loading to true if we're actually fetching data
    this.isStaffListLoading = true;
    this.isParticipantListLoading = true;

    this.organizationUserService.getUsersByRole('staff').subscribe({
      next: (staff) => {
        this.staff = staff;
        this.isStaffListLoading = false;
      },
      error: (error) => {
        console.error('Error loading staff:', error);
        this.isStaffListLoading = false;
      }
    });

    this.organizationUserService.getUsersByRole('participant').subscribe({
      next: (participants) => {
        this.participants = participants;
        this.isParticipantListLoading = false;
      },
      error: (error) => {
        console.error('Error loading participants:', error);
        this.isParticipantListLoading = false;
      }
    });
  }
  storedUsers: any[] = []; // Array to store selected staff/participants
  selectedItems: Set<any> = new Set();
  loadedImages: { [url: string]: boolean } = {};
  selectedUsers: number[] = []; // Array to store selected user IDs

  isImageLoadable(url: string): boolean {
    return this.loadedImages[url] ?? false;
  }

  loadImage(url: string | null): void {
    if (!url) return;

    const img = new Image();
    img.src = url;
    img.onload = () => (this.loadedImages[url] = true);
    img.onerror = () => (this.loadedImages[url] = false);
  }

  getBackgroundStyle(url: string | null): { [key: string]: string } {
    if (url && this.isImageLoadable(url)) {
      return {
        'background-image': `url(${url})`,
        'background-size': 'cover',
        'background-position': 'center',
        'background-repeat': 'no-repeat',
      };
    } else {
      return {
        'background-image': 'url(../../../assets/images/userPlaceholder.jpg)',
        'background-size': 'cover',
        'background-position': 'center',
        'background-repeat': 'no-repeat',
      };
    }
  }
  GoPreviousForm() {
    this.stepper.goToPreviousStep();
    this.canGoBacktoFirstStep = true;
  }

  GoScheduleForm() {
    this.stepper.goToPreviousStep();
  }

  handleImageError(event: Event): void {
    const divElement = event.target as HTMLDivElement;
    divElement.style.backgroundImage = `url('../../../assets/images/userPlaceholder.jpg')`;
  }

  isSelected(item: any): boolean {
    return this.selectedItems.has(item);
  }
  onStaffSelect(staffMember: number): void {
    this.toggleSelection(staffMember);
    this.addUserToSelected(staffMember);
  }
  onParticipantSelect(participant: any): void {
    this.toggleSelection(participant);
    this.addUserToSelected(participant);
  }
  addUserToSelected(userId: number): void {
    if (!this.selectedUsers.includes(userId)) {
      this.selectedUsers.push(userId); // Add to selectedUsers array
    } else if (this.selectedUsers.includes(userId)) {
      this.selectedUsers = this.selectedUsers.filter((id) => id !== userId);
    }
  }

  storeUser(user: any): void {
    const userIndex = this.storedUsers.findIndex((u) => u.id === user.id);

    if (userIndex === -1) {
      this.storedUsers.push(user); // Add user if not already in the array
    } else {
      this.storedUsers.splice(userIndex, 1); // Remove user if already in the array
    }
  }
  toggleSelection(item: any): void {
    if (this.isSelected(item)) {
      this.selectedItems.delete(item);
    } else {
      this.selectedItems.add(item);
    }
  }
  validateEventdetailForm() {
    if (this.eventForm.valid) {
      this.stepper.goToNextStep();
      this.steps[this.stepper.selectedIndex].isCompleted = true;
    }
  }
  validateSchedulleForm() {
    if (this.canGoBacktoFirstStep) {
      this.canGoBacktoFirstStep = false;
      return;
    } else {
      if (this.scheduleForm.valid) {
        this.stepper.goToNextStep();
        this.steps[this.stepper.selectedIndex].isCompleted = true;
      }
    }
  }
  OpenEventList() {
    this.router.navigateByUrl('/home/events');
  }
  redirectToAddStaff() {
    this.router.navigateByUrl('/home/staff/addStaff');
  }
  redirectToAddParticipant() {
    this.router.navigateByUrl('/home/participants/addParticipants');
  }
  onEventInfoSubmit(): void {
    if (this.fileErrorMessage) {
      return;
    }
    if (this.eventForm.valid) {
      this.isEventDTOLoading = true;

      if (this.selectedFile) {
        const containerName = 'event-logos';
        this.uploadService
          .uploadImage(containerName, this.selectedFile)
          .subscribe({
            next: (logoUrl: string) => {
              this.createEvent(logoUrl);
            },
            error: (err) => {
              this.showNotification(
                'Error',
                `Image upload failed: ${err.message}`,
                'ok'
              );
              this.isEventDTOLoading = false;
              this.isEventCreating = false;
            },
          });
      } else {
        this.createEvent();
      }
    }
  }
  createEvent(logoUrl?: string): void {
    this.createEventDTO = {
      title: this.eventForm.get('title')?.value,
      description: this.eventForm.get('description')?.value,
      type: this.eventForm.get('checkType')?.value,
      locationNotes: this.eventForm.get('location')?.value,
      status: this.eventForm.get('statusType')?.value,
      logoUrl: logoUrl,
    };
    this.eventApi.createEventRecord(this.createEventDTO).subscribe({
      next: (data: any) => {
        this.isEventDTOCreated = true;
        this.isEventDTOLoading = false;
        console.log(data);
        this.createdEventId = data.id;
        this.onEventScheduleSubmit();
      },
      error: (error) => {
        console.error('Error creating event:', error);
        this.isEventDTOLoading = false;
        this.isEventCreating = false;
      },
    });
  }
  onEventScheduleSubmit() {
    if (this.scheduleForm.valid) {
      const startDate = this.scheduleForm.get('startDate')?.value;
      const startTime = this.scheduleForm.get('startTime')?.value;
      const duration = this.scheduleForm.get('duration')?.value;
      const isRecurring = this.scheduleForm.get('isRecurring')?.value;

      try {
        const result = this.combineDateAndTime(startDate, startTime, duration);

        this.createEventScheduleDTO = {
          eventId: this.createdEventId,
          startTime: result.startTime,
          endTime: result.endTime,
          duration: duration,
          recurring: isRecurring,
          repeat: this.scheduleForm.get('repeat')?.value,
          weekDays: this.getSelectedWeekdays(),
        };

        this.isEventScheduleDtoLoading = true;
        this.eventApi
          .createEventScheduleConfig(this.createEventScheduleDTO)
          .subscribe({
            next: (response) => {
              this.isEventScheduleDtoLoading = false;
              this.assignSelectedUsers();
              this.OpenEventList();
              this.showNotification(
                'Success',
                `${this.appConstants.eventCreatedSuccessfully}`,
                'ok'
              );
            },
            error: (err) => {
              console.error('Schedule creation failed:', err);
              this.isEventScheduleDtoLoading = false;
              this.showNotification(
                'Error',
                `Schedule creation failed: ${err.message}`,
                'ok'
              );
              this.isEventCreating = false;
            },
          });
      } catch (error) {
        console.error('Error processing date and time:', error);
        this.showNotification('Error', `Invalid date or time: ${error}`, 'ok');
        this.isEventCreating = false;
      }
    }
  }
  assignSelectedUsers(): void {
    if (this.selectedUsers.length > 0) {
      this.selectedUsers.forEach((userId) => {
        this.assignUserInBackground(userId);
      });
    }
  }
  assignUserInBackground(organizationUserId: number): void {
    const eventId = this.createdEventId;

    this.eventUserService.assignUser(eventId, organizationUserId).subscribe({
      next: (response) => {
        console.log('User assigned successfully', response);
      },
      error: (error) => {
        console.error('Error:', error.message);
        this.isEventCreating = false;
      },
    });
  }
  createEventObject() {
    this.isEventCreating = true;
    this.onEventInfoSubmit();
  }   

  
    
  
    // Method to handle adding staff
    addStaff() {
      this.router.navigate(['/home/staff/addStaff']);
    }
  
    // Method to handle adding participants
    addParticipant() {
      this.router.navigate(['/home/participants/addParticipants']);
    }
  
  
}
