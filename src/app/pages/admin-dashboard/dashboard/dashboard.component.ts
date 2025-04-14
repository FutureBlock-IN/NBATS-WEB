import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { AppConstants } from '../../../app-Constants/app.constants';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import {
  BehaviorSubject,
  catchError,
  filter,
  forkJoin,
  Observable,
  of,
  tap,
  throwError,
} from 'rxjs';

import { EventScheduleResponseDTO } from '../../../models/serviceModels/event/eventScheduleResponse';
import { MainResponseEvent } from '../../../models/serviceModels/event/mainResponseEvent';
import { EventService } from '../../../services/api-services/event.service';
import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { ResponseUserDTO } from '../../../models/serviceModels/user/responseUser';
import { PostEventScheduleConfigDTO } from '../../../models/serviceModels/event/baseEventSchedule';
import { VALIDATION_MESSAGES } from '../../../utilities/constants/validation-strings';
import { MatDialog } from '@angular/material/dialog';
import { OrganizationUserService } from '../../../services/api-services/organizationUser.service';
import { EventUserService } from '../../../services/api-services/eventUser.service';
import { startDateValidator } from '../../../services/validators/datesValidator';
import { validWeekdaysValidator3 } from '../../../utilities/validators/weekdays-validator';
import { EventUserResponse } from '../../../models/serviceModels/eventUser/EventUserResponse';
import { NotificationPopupComponent } from '../../../components/shared-comps/notification-popup/notification-popup.component';

import { DashboardEventsComponent } from '../dashboard-events/dashboard-events.component';

import { DashboardStaffComponent } from '../dashboard-staff/dashboard-staff.component';
import { DashboardParticipantsComponent } from '../dashboard-participants/dashboard-participants.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    CalendarModule,
    DropdownModule,
    DashboardEventsComponent,
    DashboardStaffComponent,
    DashboardParticipantsComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements AfterViewInit, OnInit {
   
   @Input() eventI: any;

  steps: { label: string; content: TemplateRef<any> | null }[] = [
    { label: 'Home', content: null },
    { label: 'Events', content: null },
    { label: 'Staff', content: null },
    { label: 'Participants', content: null },
  ];


  currentTab: string = this.appConstants.events;


  
  @ViewChild('eventsTemplate', { static: false })
  eventsTemplate!: TemplateRef<any>;  
  @ViewChild('staffTemplate', { static: false })
  staffTemplate!: TemplateRef<any>;
  @ViewChild('ParticipantTemplate', { static: false })
  ParticipantTemplate!: TemplateRef<any>;
  homeTemplate!: TemplateRef<any>;
  @ViewChild('homeTemplate', { static: false })

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
  selectedIndex: number = 1;
  eventForm: FormGroup;
  event?: MainResponseEvent;
  savedEventData?: MainResponseEvent;
  eventSchedule?: EventScheduleResponseDTO;
  selectedUsers: number[] = [];
  selectedItems: Set<any> = new Set();
  fileErrorMessage: string | undefined;
  isEventDTOLoading: boolean = false;
  scheduleIndex: number = 1;
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
    // Initialize current tab based on current route
    this.updateCurrentTab(this.router.url);
    
    // Subscribe to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateCurrentTab(event.url);
    });

    // Retrieve the current state
    const currentState = history.state;
    
    if (currentState && currentState.event) {
      this.isLoading = true;
      this.eventSchedule = currentState.event.eventSchedule || undefined;
      this.scheduleIndex = currentState.scheduleIndex;
      this.selectedIndex = currentState.selectedIndex || 1;  // Restore the selected tab index
  
      // this.fetchEventDetails(currentState.event.id);
    }
  }
  

 

  onUserSelect(userId: number): void {
    if (!userId) return;

    const isUserAssigned = this.eventUserIds.includes(userId);
    const eventId = this.event?.id || 0;

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

  
  addUserToSelected(userId: number): void {
    if (!this.selectedUsers.includes(userId)) {
      this.selectedUsers.push(userId);
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

   

  onSave() {
    if (this.eventForm.valid) {
      console.log('Form Data:', this.eventForm.value);
      this.isEditMode = false;
    }
  }

  onCancel() {
    this.isEditMode = false;
    this.eventForm.reset();
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
    }
  }

  

  ngAfterViewInit(): void {
    this.steps[0].content = this.homeTemplate;
    this.steps[1].content = this.eventsTemplate;
    this.steps[2].content = this.staffTemplate;
    this.steps[3].content = this.ParticipantTemplate;
  
    this.cdRef.detectChanges();
  }

  onClick(i: number): void {
    this.selectedIndex = i;
    
    if (this.steps[i].label === 'Home') {
      this.router.navigate(['/home/events']);
    } else {
      switch (this.steps[i].label.toLowerCase()) {
        case 'events':
          this.router.navigate(['/dashboard/events']);
          break;
        case 'staff':
          this.router.navigate(['/dashboard/staff']);
          break;
        case 'participants':
          this.router.navigate(['/dashboard/participants']);
          break;
      }
    }
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

  setCurrentTab(tab: string): void {
    this.currentTab = tab;
    switch (tab) {
      case 'events':
        this.router.navigate(['/dashboard/events']);
        break;
      case 'staff':
        this.router.navigate(['/dashboard/staff']);
        break;
      case 'participants':
        this.router.navigate(['/dashboard/participants']);
        break;
    }
  }
  
  private updateCurrentTab(url: string): void {
    if (url.includes('/dashboard/events')) {
      this.currentTab = 'events';
    } else if (url.includes('/dashboard/staff')) {
      this.currentTab = 'staff';
    } else if (url.includes('/dashboard/participants')) {
      this.currentTab = 'participants';
    } else if (url.includes('/dashboard')) {
      this.currentTab = 'events'; // Default to events when on dashboard root
    }
  }

}
