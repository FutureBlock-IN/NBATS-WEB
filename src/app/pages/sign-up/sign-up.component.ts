// sign-up.component.ts
import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  QueryList,
  ViewChildren,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { ThemeService } from '../../services/themes/theme.service';
import { BehaviorSubject } from 'rxjs';
import {
  FormControl,
  FormGroup,
  FormsModule,
  Validators,
  ReactiveFormsModule,
  ValidationErrors,
  AbstractControl,
} from '@angular/forms';
import { StepBlockService } from '../../services/notifiers/setpBlock.notifier';
import { MatDialog } from '@angular/material/dialog';
import { NotificationPopupComponent } from '../../components/shared-comps/notification-popup/notification-popup.component';
import { OrganizationUserService } from '../../services/api-services/organizationUser.service';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { OrganizationData } from '../../models/authModels/organization';
import { AuthDataService } from '../../services/auth/AuthData.service';
import { setInLocalStorage } from '../../services/mutations/createBaseOrg.serve';
import { UploadService } from '../../services/api-services/uploadFile.service';
import { Location } from '@angular/common';
import { CustomValidators } from '../../utilities/validators/custom-validators';
import { StateSelectorComponent } from '../../components/shared-comps/state-selector/state-selector.component';
import { UsaStatesService } from '../../services/data-load-services/usaStates.service';
import { AuthService } from '@auth0/auth0-angular';
import { VALIDATION_MESSAGES } from '../../utilities/constants/validation-strings';
import { PhoneNumberValidator } from '../../utilities/validators/phone-number-validator';
import { LOGGING_MESSAGES } from '../../utilities/constants/logging.constants';
import { AppConstants } from '../../app-Constants/app.constants';
import { EmailCheckService } from '../../services/api-services/emailCheck.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    MatIcon,
    MatProgressBar,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    StateSelectorComponent,
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
})
export class SignUpComponent implements OnInit {
  @ViewChild('fileUpload') fileUpload!: ElementRef;

  subId: string = '';
  isLoading: boolean = false;
  auth0Token: string = '';
  isSaveButtonDisabled = false;
  selectedFileName: string | undefined;
  selectedFile: File | null = null;
  fileErrorMessage: string | undefined;

  // selectedFileName: string = '';
  fileSizeError: string | null = null;

  stateOptions: { name: string; iso2: string; iso3: string }[] = [];
  filteredStateOptions: { name: string; iso2: string; iso3: string }[] = [];
  selectedStateName: string | undefined;

  validationMessages = VALIDATION_MESSAGES;

  getAuthToken() {
    const token = localStorage.getItem('auth0-token');
    if (token) {
      this.auth0Token = token;
      const decodedToken: any = jwtDecode(token); // Use jwtDecode instead of jwt_decode
      this.subId = decodedToken.sub;
    }
  }
  setEmailToOrgForm() {
    const email = localStorage.getItem('auth-email');
    this.organisationForm.controls['Email'].setValue(email);
  }
  ngOnInit(): void {
    this.getAuthToken();
    this.setEmailToOrgForm();
    this.loadStates();
    this.stepBlockService.isStepBlockActive.set(false);
  }

  constructor(
    public stepBlockService: StepBlockService,
    private dialog: MatDialog,
    private location: Location,
    private orgUserApi: OrganizationUserService,
    private router: Router,
    private authDataService: AuthDataService,
    private uploadService: UploadService,
    private usaStatesService: UsaStatesService,
    private auth: AuthService,
    private appConstants: AppConstants,
    private emailService: EmailCheckService
  ) {
    this.organisationForm = new FormGroup({
      OrganizationName: new FormControl<string>('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),   
      ]),
      FirstName: new FormControl<string>('', [
        CustomValidators.nameValidator(),
      ]),
      logoUrl: new FormControl<string>('', [
        CustomValidators.nameValidator(),
      ]),
      LastName: new FormControl<string>('', [CustomValidators.nameValidator()]),
      Email: new FormControl<string>('', [CustomValidators.emailValidator()]),
      Phone: new FormControl<string>('', [
        Validators.required,
        PhoneNumberValidator.validPhoneNumber(),
      ]),
      Address: new FormControl<string>('', [
        CustomValidators.addressValidator(),
      ]),
      state: new FormControl<string>('', [CustomValidators.nameValidator()]),
      city: new FormControl<string>('', [CustomValidators.nameValidator()]),
      zip: new FormControl<string>('', [CustomValidators.zipValidator()]),
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

  onStateChange(stateIso2: string): void {
    const selectedState = this.stateOptions.find(
      (state) => state.iso2 === stateIso2
    );
    if (selectedState) {
      this.selectedStateName = selectedState.name;
      this.organisationForm.patchValue({ state: stateIso2 });
    }
  }
  onStateValidationStatus(isValid: boolean): void {
    const stateControl = this.organisationForm.get('state');
    if (stateControl) {
      if (isValid) {
        stateControl.setErrors(null);
      } else {
        stateControl.setErrors({ invalidState: true });
      }
    }
  }

  goBack() {
    this.location.back();
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
        this.fileErrorMessage = 'File size exceeds the 3 MB limit. Please upload a smaller image.';
        this.selectedFileName = undefined;
        this.selectedFile = null;
        return;
      }

      this.fileErrorMessage = undefined;
      this.selectedFileName = file.name;
      this.selectedFile = file;
    }
  }

  @ViewChild('otpInput') otpInput!: ElementRef;
  @ViewChildren('otpBox') otpBoxes!: QueryList<ElementRef>;
  organisationForm: FormGroup;
  otp: string[] = ['', '', '', '', ''];
  isStepBlockActiveFirst: boolean = true;
  isStepBlockActiveSecond: boolean = false;
  themeService: ThemeService = inject(ThemeService);
  isOtpSent: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isDarkMode: boolean = false;

  onSubmit(): void {
    if (this.fileErrorMessage) {
      return;
    }

    if (this.organisationForm.valid) {
      this.isSaveButtonDisabled = true;
      if (this.selectedFile) {
        const containerName = 'organization-logos';
        this.uploadService
          .uploadImage(containerName, this.selectedFile)
          .subscribe({
            next: (logoUrl: string) => {
              this.createOrganizationSetup(logoUrl);
              this.isSaveButtonDisabled = true;
              console.log('Pop Message');
              this.showNotification(
                this.appConstants.organizationUnderReview,
                this.appConstants.organizationUnderReviewMessage,
                'Ok'
              )
                .afterClosed()
                .subscribe(() => {
                  console.log('Notification dialog closed. Logging out.');
                  this.auth.logout({
                    logoutParams: {
                      returnTo: document.location.origin,
                    },
                  });
                  this.isSaveButtonDisabled = true;
                });
              this.isSaveButtonDisabled = true;
            },
            error: (err) => {
              console.error('Error uploading image:', err);
              this.showNotification(
                'Error',
                `Image upload failed: ${err.message}`,
                'ok'
              );
              this.isSaveButtonDisabled = false;  // Enable button on error
            },
          });
      } else {
        this.isSaveButtonDisabled = true;
        console.log('Organization is under review. Showing notification.');
        this.showNotification(
          this.appConstants.organizationUnderReview,
          this.appConstants.organizationUnderReviewMessage,
          'Ok'
        )
          .afterClosed()
          .subscribe(() => {
            console.log('Notification dialog closed. Logging out.');
          });
      }
    }
  }

  navigateToLandingPageOnCancelOrSignIn(): void {
    this.auth.logout({
      logoutParams: {
        returnTo: document.location.origin,
      },
    });
  }

  private createOrganizationSetup(logoUrl?: string): void {
    const organizationData = this.createOrganizationData();

    if (logoUrl) {
      organizationData.organization.logoLink = logoUrl;
    }

    this.orgUserApi.CreateOrganization(organizationData).subscribe(
      (response) => {
        console.log('Organization created successfully:', response);
        setInLocalStorage(response).then(() => {
          this.authDataService.initialize().then(() => {
            // this.navigateToLandingPageOnCancelOrSignIn();
          });
        });
      },
      (error) => {
        console.error('Error creating organization:', error);
      }
    );
  }

  showEmailVerification() {
    this.isOtpSent.next(true);
    this.isStepBlockActiveSecond = false;
    this.stepBlockService.isStepBlockActive.set(true);
    // this.otpInput.nativeElement.focus();
  }
  activeIndex: number = 0;

  onOtpChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Update the otp array
    this.otp = value.split('').concat(Array(5 - value.length).fill(''));

    // Update the active index
    this.activeIndex = value.length < 5 ? value.length : 4;

    if (value.length === 5) {
      this.verifyOtp();
    }
  }
  toggleTheme() {
    this.themeService.updateTheme();
    if (this.themeService.themeSignal() === 'dark') {
      this.isDarkMode = true;
    } else {
      this.isDarkMode = false;
    }
  }
  verifyOtp() {
    const otpCode = this.otp.join('');
    console.log('OTP Code:', otpCode);
    // Add your OTP verification logic here
    this.openConfirmationDialog();
  }
  createOrganizationData(): OrganizationData {
    return {
      organization: {
        name: this.organisationForm.get('OrganizationName')?.value || '',
        logoLink: null,
      },
      organizationUser: {
        firstName: this.organisationForm.get('FirstName')?.value || '',
        lastName: this.organisationForm.get('LastName')?.value || '',
        email: this.organisationForm.get('Email')?.value || '',
        phone: this.organisationForm.get('Phone')?.value || '',
        address: this.organisationForm.get('Address')?.value || '',
        city: this.organisationForm.get('city')?.value || null,
        zip: this.organisationForm.get('zip')?.value || null,
        externalUserId: this.subId,
        state: this.organisationForm.get('state')?.value || null,
      },
    };
  }

  openConfirmationDialog() {
    this.dialog.open(NotificationPopupComponent, {
      width: 'auto',
      height: 'auto',
      disableClose: false,
      data: {
        message: 'Setup Complete',
        buttonName: 'OK',
      },
    });
  }

  // showNotification(title: string, message: string, buttonName: string): void {
  //   this.dialog.open(NotificationPopupComponent, {
  //     data: {
  //       title,
  //       message,
  //       buttonName,
  //     },
  //   });
  // }

  showNotification(title: string, message: string, buttonName: string) {
    return this.dialog.open(NotificationPopupComponent, {
      data: {
        title,
        message,
        buttonName,
      },
    });
  }
}
