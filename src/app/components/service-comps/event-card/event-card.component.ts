import { Component, Input } from '@angular/core';
import { ResponseEventDTO } from '../../../models/serviceModels/event/responseEvent';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [MatIconModule, MatListModule ,CommonModule],
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.css']
})
export class EventCardComponent {
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
    endTime: ''
  };
  
  @Input() showDescription: boolean = false;  // Default value is false

  handleImageError(event: any) {
    event.target.src = "../../../../assets/images/eventPlaceholder.jpg";
  }
}
