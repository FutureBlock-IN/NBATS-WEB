import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserCardComponent } from '../../components/service-comps/user-card/user-card.component';
import { OrganizationUserService } from '../../services/api-services/organizationUser.service';
import { AppConstants } from '../../app-Constants/app.constants';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { ResponseUserDTO } from '../../models/serviceModels/user/responseUser';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-participants',
  standalone: true,
  imports: [
    CommonModule,
    UserCardComponent,
    FormsModule,
    MatInputModule,
    MatIcon,
  ],
  templateUrl: './participants.component.html',
  styleUrls: ['./participants.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class ParticipantsComponent implements OnInit {
  participants: ResponseUserDTO[] = [];
  searchTerm: string = '';

  isLoading = true;
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
    this.router.navigate(['/home/user-details/p', participantId]);
  }

  navigateToAddParticipant(): void {
    this.router.navigate(['/home/participants/addParticipants']);
  }
}
