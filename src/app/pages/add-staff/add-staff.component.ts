import { Component, ElementRef, ViewChild, OnInit, Input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { baseUser } from '../../models/serviceModels/user/baseUser';
import { OrganizationUserService } from '../../services/api-services/organizationUser.service';
import { NotificationPopupComponent } from '../../components/shared-comps/notification-popup/notification-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { UploadService } from '../../services/api-services/uploadFile.service';
import { Location } from '@angular/common';
import { CustomValidators } from '../../utilities/validators/custom-validators';
import { UsaStatesService } from '../../services/data-load-services/usaStates.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { StateSelectorComponent } from '../../components/shared-comps/state-selector/state-selector.component';
import { VALIDATION_MESSAGES } from '../../utilities/constants/validation-strings';
import { PhoneNumberValidator } from '../../utilities/validators/phone-number-validator';
import { EventService } from '../../services/api-services/event.service';
import { ResponseEventDTO } from '../../models/serviceModels/event/responseEvent';
import { ItemSelectorComponent } from '../../components/shared-comps/item-selector/item-selector.component';
import { EventUserService } from '../../services/api-services/eventUser.service';
import { Router } from '@angular/router';
import { AppConstants } from '../../app-Constants/app.constants';
import { LOGGING_MESSAGES } from '../../utilities/constants/logging.constants';

@Component({
  selector: 'app-add-staff',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    StateSelectorComponent,
    ItemSelectorComponent,
  ],
  templateUrl: './add-staff.component.html',
  styleUrls: ['./add-staff.component.css'],
})
export class AddStaffComponent implements OnInit {
  @ViewChild('fileUpload') fileUpload!: ElementRef;

  staffForm: FormGroup;
  selectedFileName: string | undefined;
  selectedFile: File | null = null;
  fileErrorMessage: string | undefined;
  stateOptions: { name: string; iso2: string; iso3: string }[] = [];
  filteredStateOptions: { name: string; iso2: string; iso3: string }[] = [];
  selectedStateName: string | undefined;
  validationMessages = VALIDATION_MESSAGES;
  events: ResponseEventDTO[] = [];
  isLoadingEvents = true;
  eventIds: number[] = [];
  isStaffCreating: boolean = false;
  @Input() showSearchBar: boolean = true;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private userService: OrganizationUserService,
    private uploadService: UploadService,
    private location: Location,
    private usaStatesService: UsaStatesService,
    private eventService: EventService,
    private eventUserService: EventUserService,
    private constants: AppConstants
  ) {
    this.staffForm = this.fb.group({
      firstName: ['', CustomValidators.nameValidator()],
      lastName: ['', CustomValidators.nameValidator()],
      email: ['', [CustomValidators.emailValidator()]],
      phone: [
        '',
        [Validators.required, PhoneNumberValidator.validPhoneNumber()],
      ],
      address: ['', CustomValidators.addressValidator],
      city: ['', CustomValidators.nameValidator()],
      zip: ['', CustomValidators.zipValidator()],
      state: ['', CustomValidators.nameValidator()],
      role: ['admin', Validators.required],
    });
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
      },
    });
  }

  loadStates(): void {
    this.usaStatesService.getStates().subscribe(
      (data) => {
        this.stateOptions = data;
        this.filteredStateOptions = data;
      },
      (error) => {
        console.error(
          LOGGING_MESSAGES.statesDataLoadError.replace(
            '{message}',
            error.message
          )
        );
      }
    );
  }

  onEventSelect(eventId: number): void {
    console.log('Selected event:', eventId);

    if (eventId && !this.eventIds.includes(eventId)) {
      this.eventIds.push(eventId);
    } else if (this.eventIds.includes(eventId)) {
      this.eventIds = this.eventIds.filter((id) => id !== eventId);
    }
  }

  onStateChange(stateIso2: string): void {
    const selectedState = this.stateOptions.find(
      (state) => state.iso2 === stateIso2
    );
    if (selectedState) {
      this.selectedStateName = selectedState.name;
      this.staffForm.patchValue({ state: stateIso2 });
    }
  }

  onSubmitStaff(): void {
    const formValue = this.staffForm.value;
    const staffData: baseUser = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phone: formValue.phone,
      address: formValue.address,
      city: formValue.city,
      zip: formValue.zip,
      state: formValue.state,
      externalUserId: formValue.email,
      role: formValue.role,
      minor: false,
      logoUrl: this.selectedFile ? undefined : formValue.logoUrl,
    };

    if (this.selectedFile) {
      const containerName = 'organization-user-logos';
      this.uploadService
        .uploadImage(containerName, this.selectedFile)
        .subscribe({
          next: (logoUrl: string) => {
            this.createUser(staffData, logoUrl);
          },
          error: (err) => {
            this.showNotification(
              'Error',
              `Image upload failed: ${err.message}`,
              'ok'
            );
          },
        });
    } else {
      this.createUser(staffData);
    }
  }

  createUser(staffData: baseUser, logoUrl?: string): void {
    if (logoUrl) {
      staffData.logoUrl = logoUrl;
    }
    this.isStaffCreating = true;
    this.userService.createUser(staffData).subscribe({
      next: (response) => {
        const userId = response.id;
        if (userId) {
          this.assignUserToEvents(userId);
        } else {
          this.showNotification('Error', 'User ID not found in response', 'ok');
        }
        this.isStaffCreating = false;
        this.router.navigateByUrl(this.constants.staffTabRoute);
        this.showNotification(
          'Success',
          `${this.constants.staffCreatedSuccessfully}`,
          'ok'
        );
      },
      error: (err) => {
        this.isStaffCreating = false;
        this.showNotification('Error', `${err.message}`, 'ok');
      },
    });
  }

  assignUserToEvents(userId: number): void {
    if (this.eventIds && this.eventIds.length > 0) {
      this.eventIds.forEach((eventId: number) => {
        this.eventUserService.assignUser(eventId, userId).subscribe({
          next: () => {
            console.log(`User ${userId} assigned to event ${eventId}`);
          },
          error: (err) => {
            this.isStaffCreating = false;
            this.showNotification(
              'Error',
              `Failed to assign user to event ${eventId}: ${err.message}`,
              'ok'
            );
          },
        });
      });
    }
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
        this.fileErrorMessage =
          'Unsupported file type. Only JPEG, JPG, and PNG are allowed.';
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

  showNotification(title: string, message: string, buttonName: string): void {
    this.dialog.open(NotificationPopupComponent, {
      data: {
        title,
        message,
        buttonName,
      },
    });
  }
}
