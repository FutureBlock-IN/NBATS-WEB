import { Component, NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserCardComponent } from '../../components/service-comps/user-card/user-card.component';
import { OrganizationUserService } from '../../services/api-services/organizationUser.service';
import { AppConstants } from '../../app-Constants/app.constants';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { ResponseUserDTO } from '../../models/serviceModels/user/responseUser';
import { StaffAccessValidator } from '../../utilities/validators/staff-access-validators';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [CommonModule, UserCardComponent, FormsModule, MatIcon],
  templateUrl: './staff.component.html',
  styleUrls: ['./staff.component.css'],
})
export class StaffComponent implements OnInit {
  staff: ResponseUserDTO[] = [];
  isLoading = true;
  searchTerm: string = '';
  areStaffAvailable: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    true
  );

  constructor(
    private organizationUserService: OrganizationUserService,
    private appConstants: AppConstants,
    private router: Router,
    private staffAccessValidator: StaffAccessValidator
  ) {}

  ngOnInit(): void {
    this.getStaff();
  }

  getStaff(): void {
    this.isLoading = true;
    this.organizationUserService
      .getUsersByRole(this.appConstants.staff)
      .subscribe({
        next: (data: ResponseUserDTO[]) => {
          this.staff = data;
          this.areStaffAvailable.next(this.staff.length > 0);
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error(this.appConstants.errorFetchingStaff, error);
          this.areStaffAvailable.next(false);
          this.isLoading = false;
        },
      });
  }

  filteredParticipants() {
    if (!this.searchTerm) {
      return this.staff;
    }

    return this.staff.filter((staff) =>
      `${staff.firstName} ${staff.lastName}`
        .toLowerCase()
        .includes(this.searchTerm.toLowerCase())
    );
  }

  navigateToStaffDetails(staffId: string): void {
    this.router.navigate(['/home/user-details/s', staffId]);
  }

  navigateToAddStaff(): void {
    this.staffAccessValidator.navigateToAddStaff();
  }
}
