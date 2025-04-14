import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { StepperComponentComponent } from '../../components/shared-comps/stepper-component/stepper-component.component';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { MainResponseEvent } from '../../models/serviceModels/event/mainResponseEvent';
import { EventService } from '../../services/api-services/event.service';
import { MatDialog } from '@angular/material/dialog';
import { NotificationPopupComponent } from '../../components/shared-comps/notification-popup/notification-popup.component';
import { VALIDATION_MESSAGES } from '../../utilities/constants/validation-strings';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { EventScheduleResponseDTO } from '../../models/serviceModels/event/eventScheduleResponse';
import { startDateValidator } from '../../services/validators/datesValidator';
import { validWeekdaysValidator3 } from '../../utilities/validators/weekdays-validator';
import { UserSelectorComponent } from '../../components/shared-comps/user-selector/user-selector.component';
import { OrganizationUserService } from '../../services/api-services/organizationUser.service';
import { AppConstants } from '../../app-Constants/app.constants';
import { ResponseUserDTO } from '../../models/serviceModels/user/responseUser';
import { BehaviorSubject, forkJoin, Observable, of, throwError } from 'rxjs';
import { ItemSelectorComponent } from '../../components/shared-comps/item-selector/item-selector.component';
import { EventUserService } from '../../services/api-services/eventUser.service';
import { EventUserResponse } from '../../models/serviceModels/eventUser/EventUserResponse';
import { tap, catchError } from 'rxjs/operators';
import { PostEventScheduleConfigDTO } from '../../models/serviceModels/event/baseEventSchedule';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [
    CommonModule,
    StepperComponentComponent,
    ReactiveFormsModule,
    CalendarModule,
    DropdownModule,
    UserSelectorComponent,
    ItemSelectorComponent,
  ],
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.css'], // Fixed here
})
export class EventDetailsComponent implements AfterViewInit, OnInit {
  onSchedulingNext() {
    if (this.schedulingForm.invalid) {
      this.schedulingForm.markAllAsTouched();
      console.log('Form has errors');
      return;
    }

    if (this.schedulingForm.valid) {
      const data = this.assembleScheduleData();
      console.log(data);
    }
  }

  //Define your steps (tabs)
  steps: { label: string; content: TemplateRef<any> | null }[] = [
    { label: 'Information', content: null },
    { label: 'Scheduling', content: null },
    { label: 'Staff & Participants', content: null },
  ];

  //Template references for each tab content
  @ViewChild('informationTemplate', { static: false })
  informationTemplate!: TemplateRef<any>;
  @ViewChild('schedulingTemplate', { static: false })
  schedulingTemplate!: TemplateRef<any>;
  @ViewChild('staffParticipantTemplate', { static: false })
  staffParticipanttemplate!: TemplateRef<any>;

  isLoading: boolean = false;
  isEditMode: boolean = true;
  selectedStaffIds: Set<number> = new Set();
  selectedParticipantIds: Set<number> = new Set();
  eventUserIds: number[] = [];
  loadedImages: { [url: string]: boolean } = {};
  NoParticipants: boolean = false;
  NoStaff: boolean = false;
  staff: ResponseUserDTO[] = [];
  participants: ResponseUserDTO[] = [];
  isStaffListLoading: boolean = false;
  isParticipantListLoading: boolean = false;
  schedulingForm: FormGroup;
  selectedIndex: number = 0;
  eventForm: FormGroup;
  event?: MainResponseEvent;
  savedEventData?: MainResponseEvent;
  eventSchedule?: EventScheduleResponseDTO;
  selectedUsers: number[] = [];
  selectedItems: Set<any> = new Set();
  fileErrorMessage: string | undefined;
  isEventDTOLoading: boolean = false;
  scheduleIndex: number = 0;
  updateEventScheduleDTO!: PostEventScheduleConfigDTO;
  eventDetailsChanged: boolean = false;
  eventScheduleConfigChanged: boolean = false;
  staffAndParticipantsChanged: boolean = false;
  isEventUpdating: boolean = false;

  validationMessages = VALIDATION_MESSAGES;

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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private eventService: EventService,
    private dialog: MatDialog,
    private organizationUserService: OrganizationUserService,
    private appConstants: AppConstants,
    private eventUserService: EventUserService
    
  ) {
    this.eventForm = new FormGroup({
      title: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
      ]),
      description: new FormControl('', [Validators.required]),
      locationNotes: new FormControl('', Validators.required),
      type: new FormControl('', Validators.required),
      status: new FormControl('', Validators.required),
    });

    this.schedulingForm = new FormGroup(
      {
        startDate: new FormControl('', [
          Validators.required,
          startDateValidator(),
        ]),
        startTime: new FormControl('', [Validators.required]),
        endDate: new FormControl('', [Validators.required]),
        duration: new FormControl('', [Validators.required]),
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
      {
        validators: validWeekdaysValidator3('startDate', 'endDate', 'weekdays'),
      }
    );
  }

  ngOnInit(): void {
    this.isStaffListLoading = true;
    this.isParticipantListLoading = true;
    const currentState = history.state;
    this.eventSchedule =
      currentState && currentState.event.eventSchedule
        ? currentState.event.eventSchedule
        : undefined;
    this.scheduleIndex = currentState.scheduleIndex;

    if (currentState && currentState.event) {
      this.isLoading = true;
      this.eventService.getFullEventByEventId(currentState.event.id).subscribe({
        next: (response: any) => {
          this.event = response;
          this.populateEventForm();
          this.populateScheduleForm();
          this.getEventUsers(this.event?.id || 0);
          this.getStaffAndParticipants();
          this.isLoading = false;
        },
        error: (err) => {
          this.isStaffListLoading = false;
          this.isParticipantListLoading = false;
          this.showNotification('Error', `${err.message}`, 'ok');
          this.isLoading = false;
        },
      });
    } else {
      console.log('No event data found in router state');
    }

    this.router.events.subscribe((event) => {
      if (
        event instanceof NavigationEnd &&
        this.router.url.includes('/event-details')
      ) {
        if (this.event?.id) {
          this.fetchEventDetails(this.event.id);
          console.log('EventName', this.event.title);
        }
      }
    });

    this.subscribeToDateChanges();
  }

  fetchEventDetails(eventId: number): void {
    this.eventService.getFullEventByEventId(eventId).subscribe({
      next: (response: any) => {
        console.log(response, 'DataCurrent');
        this.event = response;
        this.eventSchedule = this.event?.eventScheduleConfig?.eventSchedule[0];

        this.populateEventForm();
        this.populateScheduleForm();
        this.getEventUsers(this.event?.id || 0);
        this.getStaffAndParticipants();

        this.isLoading = false;
      },
      error: (err) => {
        this.isStaffListLoading = false;
        this.isParticipantListLoading = false;
        this.showNotification('Error', `${err.message}`, 'ok');
        this.isLoading = false;
      },
    });
  }

  subscribeToDateChanges(): void {
    this.schedulingForm
      .get('startDate')
      ?.valueChanges.subscribe((startDate: string) => {
        const endDate = this.schedulingForm.get('endDate')?.value;
        if (
          startDate &&
          endDate &&
          this.schedulingForm.get('repeat')?.value === 'Daily'
        ) {
          this.selectWeekdaysInRange(new Date(startDate), new Date(endDate));
        }
      });

    this.schedulingForm
      .get('endDate')
      ?.valueChanges.subscribe((endDate: string) => {
        const startDate = this.schedulingForm.get('startDate')?.value;
        if (
          startDate &&
          endDate &&
          this.schedulingForm.get('repeat')?.value === 'Daily'
        ) {
          this.selectWeekdaysInRange(new Date(startDate), new Date(endDate));
        }
      });
  }

  onUserSelect(userId: number): void {
    if (!userId) return;

    const isUserAssigned = this.eventUserIds.includes(userId);
    const eventId = this.event?.id || 0;
    console.log(eventId, 'StaffEventId');
    if (!isUserAssigned) {
      this.eventUserIds.push(userId);
      this.eventUserService.assignUser(eventId, userId).subscribe(() => {});
    } else {
      this.eventUserIds = this.eventUserIds.filter((id) => id !== userId);
      this.eventUserService.deleteUser(eventId, userId).subscribe(() => {});
    }

    this.staffAndParticipantsChanged = true;
  }

  getEventUsers(eventId: number): void {
    this.eventUserService.getUsers(eventId).subscribe(
      (eventUsers: EventUserResponse[]) => {
        this.eventUserIds = eventUsers.map(
          (eventUser) => eventUser.organizationUserResponseDTOs.id
        );
        eventUsers.forEach((eventUser) => {
          const responseUser: ResponseUserDTO =
            this.mapToResponseUserDTO(eventUser);
          if (
            eventUser.role === this.appConstants.staff ||
            eventUser.role === this.appConstants.admin
          ) {
            this.selectedStaffIds.add(responseUser.id);
            this.toggleSelection(responseUser.id);
          } else if (eventUser.role === 'participant') {
            this.selectedParticipantIds.add(responseUser.id);
            this.toggleSelection(responseUser.id);
          }
        });
        this.isStaffListLoading = false;
        this.isParticipantListLoading = false;
        console.log('Staff:', this.staff);
        console.log('Participants:', this.participants);
      },
      (error: any) => {
        this.isStaffListLoading = false;
        this.isParticipantListLoading = false;
        console.error('Error fetching event users', error);
      }
    );
  }

  mapToResponseUserDTO(eventUser: EventUserResponse): ResponseUserDTO {
    const organizationUser = eventUser.organizationUserResponseDTOs;

    return {
      id: organizationUser.id,
      organizationId: organizationUser.organizationId,
      firstName: organizationUser.firstName,
      lastName: organizationUser.lastName,
      email: organizationUser.email,
      phone: organizationUser.phone,
      address: organizationUser.address || null,
      state: organizationUser.state,
      city: organizationUser.city || null,
      zip: organizationUser.zip || null,
      externalUserId: organizationUser.externalUserId,
      role: organizationUser.role,
      minor: organizationUser.minor,
      logoUrl: organizationUser.logoUrl || null,
      createdOn: organizationUser.createdOn,
    };
  }

  onStaffSelect(eventUser: any) {
    if (eventUser.role === 'staff') {
      eventUser.assignUser(this.event?.id, eventUser.id).subscribe({
        next: (response: any) => {
          this.staff.push(eventUser);
          this.selectedStaffIds.add(eventUser.id);
        },
        error: (err: Error) => {
          this.showNotification('Error', `${err.message}`, 'ok');
        },
      });
    }
  }

  onParticipantSelect(eventUser: any) {
    if (eventUser.role === 'participant') {
      eventUser.assignUser(this.event?.id, eventUser.id).subscribe({
        next: (response: any) => {
          this.participants.push(eventUser);
          this.selectedParticipantIds.add(eventUser.id);
        },
        error: (err: Error) => {
          this.showNotification('Error', `${err.message}`, 'ok');
        },
      });
    }
  }
  addUserToSelected(userId: number): void {
    if (!this.selectedUsers.includes(userId)) {
      this.selectedUsers.push(userId); // Add to selectedUsers array
    } else if (this.selectedUsers.includes(userId)) {
      this.selectedUsers = this.selectedUsers.filter((id) => id !== userId);
    }
  }
  toggleSelection(item: any): void {
    if (this.isSelected(item)) {
      this.selectedItems.delete(item);
    } else {
      this.selectedItems.add(item);
    }
  }
  isSelected(item: any): boolean {
    return this.selectedItems.has(item);
  }

  createEventObject() {
    this.isEventUpdating = true;
    this.eventDetailsChanged = this.isEventDetailsChanged();
    this.eventScheduleConfigChanged = this.isEventScheduleConfigChanged();

    if (this.eventDetailsChanged || this.eventScheduleConfigChanged) {
      const updateTasks = [];

      if (this.eventDetailsChanged)
        updateTasks.push(this.updateEvent().pipe(catchError(() => of(null))));

      if (this.eventScheduleConfigChanged)
        updateTasks.push(
          this.UpdateEventScheduleConfig().pipe(catchError(() => of(null)))
        );

      forkJoin(updateTasks).subscribe(() => {
        this.onEventInfoSubmit();
      });
    } else {
      if (this.staffAndParticipantsChanged)
        this.showNotification(
          'Success',
          this.appConstants.eventUpdatedSuccessfully,
          'ok'
        );
      this.router.navigate([this.appConstants.eventsTabRoute]);
    }
  }

  isEventDetailsChanged(): boolean {
    const initialEventDetails = this.event;
    return (
      this.eventForm.get('title')?.value !== initialEventDetails?.title ||
      this.eventForm.get('description')?.value !==
        initialEventDetails?.description ||
      this.eventForm.get('type')?.value !== initialEventDetails?.type ||
      this.eventForm.get('locationNotes')?.value !==
        initialEventDetails?.locationNotes ||
      this.eventForm.get('status')?.value !== initialEventDetails?.status
    );
  }

  isEventScheduleConfigChanged(): boolean {
    const initialScheduleConfig = this.event?.eventScheduleConfig;
    const startTimeUtc = initialScheduleConfig?.startTime;
    const endTimeUtc = initialScheduleConfig?.endTime;
    let startDate, startTime, endDate;
    if (startTimeUtc) {
      startDate = new Date(startTimeUtc);
      startTime = startDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }
    if (endTimeUtc) {
      endDate = new Date(endTimeUtc);
    }

    return (
      this.schedulingForm.get('startDate')?.value.toISOString() !==
        startDate?.toISOString() ||
      this.schedulingForm.get('startTime')?.value !== startTime ||
      this.schedulingForm.get('duration')?.value !==
        initialScheduleConfig?.duration ||
      this.schedulingForm.get('isRecurring')?.value !==
        initialScheduleConfig?.recurring ||
      this.schedulingForm.get('repeat')?.value !==
        initialScheduleConfig?.repeat ||
      this.schedulingForm.get('endDate')?.value.toISOString() !==
        endDate?.toISOString() ||
      JSON.stringify(
        this.convertWeekdaysStringToDict(initialScheduleConfig?.weekDays)
      ) !== JSON.stringify(this.schedulingForm.get('weekdays')?.value)
    );
  }

  UpdateEventScheduleConfig(): Observable<any> {
    if (!this.event) return of(null);

    const startDate = this.schedulingForm.get('startDate')?.value;
    const startTime = this.schedulingForm.get('startTime')?.value;
    const duration = this.schedulingForm.get('duration')?.value;
    const isRecurring = this.schedulingForm.get('isRecurring')?.value;

    try {
      const result = this.combineDateAndTime(startDate, startTime, duration);

      this.updateEventScheduleDTO = {
        eventId: this.event.id,
        startTime: result.startTime,
        endTime: result.endTime,
        duration: duration,
        recurring: isRecurring,
        repeat: this.schedulingForm.get('repeat')?.value,
        weekDays: this.getSelectedWeekdays(),
      };

      return this.eventService
        .UpdateEventScheduleConfig(this.updateEventScheduleDTO)
        .pipe(
          catchError((err) => {
            console.error('Schedule creation failed:', err);
            this.showNotification(
              'Error',
              `Schedule creation failed: ${err.error.error}`,
              'ok'
            );
            this.eventScheduleConfigChanged = false;
            return throwError(() => new Error(err));
          })
        );
    } catch (error) {
      console.error('Error processing date and time:', error);
      this.showNotification('Error', `Invalid date or time: ${error}`, 'ok');
      return of(null);
    }
  }

  onEventInfoSubmit(): void {
    if (this.eventDetailsChanged || this.eventScheduleConfigChanged)
      this.showNotification(
        'Success',
        this.appConstants.eventUpdatedSuccessfully,
        'ok'
      );
    this.router.navigate([this.appConstants.eventsTabRoute]);
  }

  toggleEditLabels() {
    this.isEditMode = !this.isEditMode;
  }

  onSave() {
    if (this.eventForm.valid) {
      // Logic to save your form data
      console.log('Form Data:', this.eventForm.value);
      this.isEditMode = false; // Disable editing after saving
    }
  }

  onCancel() {
    this.isEditMode = false; // Disable editing
    this.eventForm.reset(); // Reset the form if needed
  }

  populateEventForm(): void {
    if (this.event) {
      this.eventForm.patchValue({
        title: this.event.title || '',
        description: this.event.description,
        type: this.event.type || '',
        locationNotes: this.event.locationNotes || '',
        status: this.event.status || '',
      });
      this.eventStatus$.next(this.event.status || 'Active');
    }
  }

  populateScheduleForm(): void {
    if (this.event) {
      const startTimeUtc = this.event.eventScheduleConfig?.startTime;
      const endTimeUtc = this.event.eventScheduleConfig?.endTime;
      let startDate, startTime, endDate;
      if (startTimeUtc) {
        startDate = new Date(startTimeUtc);
        startTime = startDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
      }
      if (endTimeUtc) {
        endDate = new Date(endTimeUtc);
      }
      this.schedulingForm.patchValue({
        startDate: startDate,
        startTime: startTime,
        duration: this.event.eventScheduleConfig?.duration,
        isRecurring: this.event.eventScheduleConfig?.recurring,
        repeat: this.event.eventScheduleConfig?.repeat,
        endDate: endDate,
        weekdays: this.convertWeekdaysStringToDict(
          this.event.eventScheduleConfig?.weekDays
        ),
      });
    }
  }

  ngAfterViewInit(): void {
    this.steps[0].content = this.informationTemplate;
    this.steps[1].content = this.schedulingTemplate;
    this.steps[2].content = this.staffParticipanttemplate;

    this.cdRef.detectChanges();
  }

  onClick(index: number): void {
    this.selectedIndex = index;

    if (index === 0) {
      this.populateEventForm();
    }
  }

  onNext() {
    console.log('Next clicked');

    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    if (this.selectedIndex < this.steps.length - 1) {
      this.selectedIndex++;
    } else {
      console.log('All steps completed');
    }
  }

  onBack() {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
    } else {
      console.log('All steps completed');
    }
  }

  updateEvent(): Observable<any> {
    if (!this.event) return of(null);

    const updatedEvent = {
      ...this.event,
      ...this.eventForm.value,
      status: this.eventForm.get('status')?.value
    };

    return this.eventService.updateEvent(updatedEvent, this.event.id).pipe(
      tap((response: any) => {
        this.savedEventData = response;
        this.event = response;
        this.populateEventForm();
        this.eventStatus$.next(response.status);
        console.log(this.savedEventData);
      }),
      catchError((err) => {
        this.showNotification('Error', `${err.message}`, 'ok');
        return throwError(() => new Error(err));
      })
    );
  }

  onEventActivity() {
    const eventId = this.event?.id;
    console.log(eventId);
    this.router.navigateByUrl(`home/eventActivity/${eventId}`, {
      state: {
        eventSchedules: this.event?.eventScheduleConfig?.eventSchedule,
        scheduleIndex: this.scheduleIndex,
      },
    });
    console.log('EventActivity', this.eventSchedule);
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

  onStartEvent() {
    if (!this.eventSchedule?.inProgress) {
      this.eventService.startEventSchedule(this.eventSchedule!.id).subscribe({
        next: (response) => {
          if (this.eventSchedule) {
            this.eventSchedule.checkoutStartedTime =
              response.checkoutStartedTime;
            this.eventSchedule.inProgress = response.inProgress;
            this.eventSchedule.checkoutEndedTime = response.checkoutEndedTime;
          }
          this.router.navigate(['/home/scanner'], {
            queryParams: {
              eventId: this.event?.id,
              eventSchedule: JSON.stringify(this.eventSchedule),
              eventType: this.event?.type,
            },
          });
        },
      });
    } else {
      this.router.navigate(['/home/scanner'], {
        queryParams: {
          eventId: this.event?.id,
          eventSchedule: JSON.stringify(this.eventSchedule),
          eventType: this.event?.type,
        },
      });
    }
  }

  getButtonLabel(): string {
    if (!this.eventSchedule?.inProgress) return 'Start Event';
    else return 'Resume Event';
  }

  eventStatus$ = new BehaviorSubject<string>('Active'); // Reactive status

  setStatus(status: string) {
    this.eventStatus$.next(status); // Update status reactively
  }
  

  handleImageError(event: any) {
    event.target.src = '../../../../assets/images/eventPlaceholder.jpg';
  }

  resizeTextarea(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
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

    if (this.schedulingForm.get('isRecurring')?.value) {
      const formEndDate = this.schedulingForm.get('endDate')?.value;
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
      startTime: combinedDate.toISOString(),
      endTime: endDate.toISOString(),
    };
  }

  convertWeekdaysStringToDict(weekdaysStr: string | undefined): {
    [key: string]: boolean;
  } {
    const dayMapping: { [key: string]: string } = {
      Mon: 'mon',
      Tue: 'tue',
      Wed: 'wed',
      Thu: 'thu',
      Fri: 'fri',
      Sat: 'sat',
      Sun: 'sun',
    };

    const weekdaysDict: { [key: string]: boolean } = {
      mon: false,
      tue: false,
      wed: false,
      thu: false,
      fri: false,
      sat: false,
      sun: false,
    };

    if (weekdaysStr) {
      const weekdaysArray = weekdaysStr.split(',');
      weekdaysArray.forEach((day) => {
        const key = dayMapping[day];
        if (key) {
          weekdaysDict[key] = true;
        }
      });
    }
    return weekdaysDict;
  }

  onRecurringChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target) {
      const repeatValue = target.value;

      if (repeatValue === 'Daily') {
        const startDate = this.schedulingForm.get('startDate')?.value;
        const endDate = this.schedulingForm.get('endDate')?.value;
        // this.selectAllWeekdays();
        this.selectWeekdaysInRange(new Date(startDate), new Date(endDate));
        this.disableWeekdays();
      } else if (repeatValue === 'Weekly') {
        this.deselectAllWeekdays();
        this.enableWeekdays();
      }
    }
  }

  updateWeekdays(action: 'enable' | 'disable' | 'setValue', value?: boolean) {
    const weekdaysGroup = this.schedulingForm.get('weekdays') as FormGroup;
    if (weekdaysGroup) {
      Object.keys(weekdaysGroup.controls).forEach((day) => {
        const control = weekdaysGroup.get(day) as FormControl;
        if (control) {
          switch (action) {
            case 'enable':
              control.enable();
              break;
            case 'disable':
              control.disable();
              break;
            case 'setValue':
              control.setValue(value);
              break;
          }
        }
      });
    }
  }

  disableWeekdays() {
    this.updateWeekdays('disable');
  }

  enableWeekdays() {
    this.updateWeekdays('enable');
  }

  deselectAllWeekdays() {
    this.updateWeekdays('setValue', false);
  }

  selectAllWeekdays() {
    this.updateWeekdays('setValue', true);
  }

  selectWeekdaysInRange(startDate: Date, endDate: Date) {
    const weekdaysGroup = this.schedulingForm.get('weekdays') as FormGroup;
    this.deselectAllWeekdays();
    const dayMapping: { [key: number]: string } = {
      0: 'sun',
      1: 'mon',
      2: 'tue',
      3: 'wed',
      4: 'thu',
      5: 'fri',
      6: 'sat',
    };

    // Normalize startDate and endDate to midnight to avoid time discrepancies
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayIndex = currentDate.getDay();
      const controlName = dayMapping[dayIndex];
      const control = weekdaysGroup.get(controlName) as FormControl;
      if (control) {
        control.setValue(true);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  convertTo12HourFormat(time: string): string {
    let [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12;
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${period}`;
  }

  getSelectedWeekdays(): string {
    const weekdaysGroup = this.schedulingForm.get('weekdays')?.value;

    const dayMapping: { [key: string]: string } = {
      mon: 'Mon',
      tue: 'Tue',
      wed: 'Wed',
      thu: 'Thu',
      fri: 'Fri',
      sat: 'Sat',
      sun: 'Sun',
    };

    // Filter selected weekdays (true values)
    const selectedDays = Object.keys(weekdaysGroup)
      .filter((day) => weekdaysGroup[day])
      .map((day) => dayMapping[day]);

    // Join the selected days into a string with commas
    return selectedDays.join(',');
  }

  assembleScheduleData() {
    let startDate = this.schedulingForm.get('startDate')?.value;
    startDate = startDate.toISOString().split('T')[0];
    let time = this.schedulingForm.get('startTime')?.value;
    time = this.convertTo12HourFormat(time);
    const duration = this.schedulingForm.get('duration')?.value;
    const timeResult = this.combineDateAndTime(
      String(new Date(startDate)),
      time,
      duration
    );
    const updateSchedulingData = {
      eventId: this.event?.id,
      startTime: timeResult.startTime,
      endTime: timeResult.endTime,
      duration: duration,
      recurring: this.schedulingForm.get('isRecurring')?.value,
      repeat: this.schedulingForm.get('repeat')?.value,
      weekDays: this.getSelectedWeekdays(),
    };

    return updateSchedulingData;
  }

  getStaffAndParticipants(): void {
    this.loadStaff();
    this.loadParticipants();
  }

  private loadStaff(): void {
    this.isStaffListLoading = true;
    this.fetchUsersByRole(this.appConstants.staff).subscribe({
      next: (data: ResponseUserDTO[]) => {
        this.staff = data;
        this.isStaffListLoading = false;
        this.NoStaff = this.staff.length === 0;
        this.loadUserImages(this.staff);
      },
      error: (error: any) => this.handleUserFetchError('staff', error),
    });
  }

  private loadParticipants(): void {
    this.isParticipantListLoading = true;
    this.fetchUsersByRole(this.appConstants.participant).subscribe({
      next: (data: ResponseUserDTO[]) => {
        this.participants = data;
        this.isParticipantListLoading = false;
        this.NoParticipants = this.participants.length === 0;
        this.loadUserImages(this.participants);
      },
      error: (error: any) => this.handleUserFetchError('participants', error),
    });
  }

  private fetchUsersByRole(role: string): Observable<ResponseUserDTO[]> {
    return this.organizationUserService.getUsersByRole(role);
  }

  private loadUserImages(users: ResponseUserDTO[]): void {
    users.forEach((user) => this.loadImage(user.logoUrl));
  }

  private handleUserFetchError(userType: string, error: any): void {
    this.isStaffListLoading =
      userType === 'staff' ? false : this.isStaffListLoading;
    this.isParticipantListLoading =
      userType === 'participants' ? false : this.isParticipantListLoading;

    const errorMessage =
      userType === 'staff'
        ? this.appConstants.errorFetchingStaff
        : this.appConstants.errorFetchingParticipants;

    console.error(errorMessage, error);
  }

  loadImage(url: string | null): void {
    if (!url) return;

    const img = new Image();
    img.src = url;
    img.onload = () => (this.loadedImages[url] = true);
    img.onerror = () => (this.loadedImages[url] = false);
  }

    // Method to handle adding staff
     // Method to handle adding staff
     addStaff() {
      this.router.navigate(['/home/staff/addStaff']);
    }
  
    // Method to handle adding participants
    addParticipant() {
      this.router.navigate(['/home/participants/addParticipants']);
    }
}
