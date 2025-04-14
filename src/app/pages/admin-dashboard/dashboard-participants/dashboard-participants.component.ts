import { Component } from '@angular/core';
import { ResponseUserDTO } from '../../../models/serviceModels/user/responseUser';
import { AppConstants } from '../../../app-Constants/app.constants';
import { OrganizationUserService } from '../../../services/api-services/organizationUser.service';
import { BehaviorSubject } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserCardComponent } from '../../../components/service-comps/user-card/user-card.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard-participants',
  standalone: true,
  imports: [CommonModule, UserCardComponent, RouterModule, FormsModule],
  templateUrl: './dashboard-participants.component.html',
  styleUrl: './dashboard-participants.component.css',
})
export class DashboardParticipantsComponent {
  participants: ResponseUserDTO[] = [];
  isLoading = true;
  searchTerm: string = '';
  areParticipantsAvailable: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(true);

  constructor(
    private organizationUserService: OrganizationUserService,
    private appConstants: AppConstants,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getParticipants();
  }

  getParticipants(): void {
    this.isLoading = true;
    this.organizationUserService
      .getUsersByRole(this.appConstants.participant)
      .subscribe({
        next: (data: ResponseUserDTO[]) => {
          this.participants = data;
          this.areParticipantsAvailable.next(this.participants.length > 0);
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error(this.appConstants.errorFetchingParticipants, error);
          this.areParticipantsAvailable.next(false);
          this.isLoading = false;
        },
      });
  }

  filteredParticipants() {
    if (!this.searchTerm) {
      return this.participants;
    }

    return this.participants.filter((participant) =>
      `${participant.firstName} ${participant.lastName}`
        .toLowerCase()
        .includes(this.searchTerm.toLowerCase())
    );
  }

  navigateToParticipantDetails(participantId: string): void {
    this.router.navigate(['participant-details/p', participantId]);
  }

  navigateToAddParticipant(): void {
    this.router.navigate(['/home/participants/addParticipants']);
  }
}
