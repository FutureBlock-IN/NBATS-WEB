import { Component, Input } from '@angular/core';
import { ResponseEventDTO } from '../../../models/serviceModels/event/responseEvent';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-all-event-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatListModule],
  templateUrl: './all-event-card.component.html',
  styleUrl: './all-event-card.component.css',
})
export class AllEventCardComponent {
  @Input() event: ResponseEventDTO = {
    id: 0,
    description: '',
    createdOn: '',
    locationNotes: '',
    logoUrl: '',
    status: '',
    title: '',
    type: '',
    updatedOn: '',
    startDate: '',
    startTime: '',
    endTime: '',
  };

  @Input() showDescription: boolean = false;

  @Input() roles:
    | { staff: number; participants: number; admins: number }
    | undefined;

  handleImageError(event: any) {
    event.target.src = '../../../../assets/images/eventPlaceholder.jpg';
  }
}
