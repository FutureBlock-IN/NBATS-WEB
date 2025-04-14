import { Component, Input , Output, EventEmitter, ElementRef, ViewChild} from '@angular/core';
import { AbstractControl, FormControl, FormsModule } from '@angular/forms';
import { ResponseUserDTO } from '../../../models/serviceModels/user/responseUser';
import { CommonModule } from '@angular/common';
import { StateSelectorComponent } from '../state-selector/state-selector.component';
import { AppConstants } from '../../../app-Constants/app.constants';
import { VALIDATION_MESSAGES } from '../../../utilities/constants/validation-strings';
import { CustomValidators } from '../../../utilities/validators/custom-validators';
import { PhoneNumberValidatorDirective} from '../../../utilities/directive/phone-number-validator-directive';
import { EmailValidatorDirective } from '../../../utilities/directive/email-validator-directive';

export interface UserUpdateEvent {
  user: ResponseUserDTO;
  file?: File;
}

@Component({
  selector: 'app-user-details-card',
  standalone: true,
  imports: [
    FormsModule, 
    CommonModule, 
    StateSelectorComponent, 
    PhoneNumberValidatorDirective,
    EmailValidatorDirective
  ],
  templateUrl: './user-details-card.component.html',
  styleUrl: './user-details-card.component.css'
})
export class UserDetailsCardComponent {

  selectedFile: File | undefined;
  fileErrorMessage: string | undefined;
  changedImage: string | ArrayBuffer | null | undefined;
  validationMessages = VALIDATION_MESSAGES;

  constructor(private appConstants: AppConstants){}

  @Input() user: ResponseUserDTO = {
    id: 0,
    organizationId: 0,
    createdOn: '',
    logoUrl: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    state: '',
    city: '',
    zip: '',
    externalUserId: '',
    role: '',
    minor: false,
  };
  
  @Output() saveChanges: EventEmitter<UserUpdateEvent> = new EventEmitter<UserUpdateEvent>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  isLoading:boolean=false;

  onSaveChanges(): void {
    this.isLoading = true
    const updatedUser: ResponseUserDTO = {
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      email: this.user.email,
      phone: this.user.phone,
      address: this.user.address,
      state: this.user.state,
      city: this.user.city,
      zip: this.user.zip,
      externalUserId: this.user.externalUserId,
      role: this.user.role,
      minor: this.user.minor,
      logoUrl: this.user.logoUrl,
      id: this.user.id,
      organizationId: this.user.organizationId,
      createdOn: this.user.createdOn,
    };

    const userUpdateEvent: UserUpdateEvent = {
      user: updatedUser,
      file: this.selectedFile,
    };
    
    this.saveChanges.emit(userUpdateEvent);
    setTimeout(() => {
      this.isLoading = false;
    }, 3000);
  }

  onStateChange(stateIso2: string): void {
    this.user.state = stateIso2;
  }

  onChangePhotoClick(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const fileType = file.type;
      const fileSize = file.size

      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validImageTypes.includes(fileType)) {
        this.fileErrorMessage = this.validationMessages.ImageValidation.supportedFormats;
        this.selectedFile = undefined;
        return;
      }

      const maxSizeInMB = 3;
      if (fileSize > maxSizeInMB * 1024 * 1024) {
        this.fileErrorMessage = this.validationMessages.ImageValidation.fileSizeLimit;
        this.selectedFile = undefined;
        return;
      }

      this.fileErrorMessage = undefined;
      this.selectedFile = file;

      this.showChangedImage(file);
    }
  }

  showChangedImage(file:File){
    this.changedImage = URL.createObjectURL(file);
  }

  getDefaultUserImage(): string{
    return this.appConstants.profilePlaceholderUrl;
  }

  allowOnlyNumbers(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^0-9]/g, '');
    input.value = value;
    this.user.zip = value;
  }
  
}
