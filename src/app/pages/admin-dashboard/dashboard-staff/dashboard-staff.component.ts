import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserCardComponent } from '../../../components/service-comps/user-card/user-card.component';
import { ResponseUserDTO } from '../../../models/serviceModels/user/responseUser';
import { BehaviorSubject } from 'rxjs';
import { OrganizationUserService } from '../../../services/api-services/organizationUser.service';
import { AppConstants } from '../../../app-Constants/app.constants';
import { StaffAccessValidator } from '../../../utilities/validators/staff-access-validators';

@Component({
  selector: 'app-dashboard-staff',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, UserCardComponent],
  templateUrl: './dashboard-staff.component.html',
  styleUrl: './dashboard-staff.component.css',
})
export class DashboardStaffComponent implements OnInit {
  staff: ResponseUserDTO[] = [];
  isLoading = true;
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

  navigateToStaffDetails(staffId: string): void {
    this.router.navigate(['staff-details/s', staffId]);
  }

  navigateToAddStaff(): void {
    this.staffAccessValidator.navigateToAddStaff();
  }

  searchTerm: string = '';

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
}
