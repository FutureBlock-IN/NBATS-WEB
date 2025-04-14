import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { EventService } from '../../services/api-services/event.service';
import { Router } from '@angular/router';
import { EventActivityDTO } from '../../models/serviceModels/eventActivity/eventActivity';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserActivityCardComponent } from '../../components/shared-comps/user-activity-card/user-activity-card.component';
import { EventScheduleResponseDTO } from '../../models/serviceModels/event/eventScheduleResponse';

@Component({
  selector: 'app-event-activity',
  standalone: true,
  imports: [CommonModule, UserActivityCardComponent],
  templateUrl: './event-activity.component.html',
  styleUrls: ['./event-activity.component.css']
})
export class EventActivityComponent implements OnInit {
  selectedTab: string = 'participants';
  participants: EventActivityDTO[] = [];
  staff: EventActivityDTO[] = [];
  loading: boolean = false; 
  eventSchedules: EventScheduleResponseDTO[] = [];
  selectScheduleId: number = 0;

  constructor(private eventService: EventService, private route: ActivatedRoute, private cdRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.eventSchedules = history.state.eventSchedules;
    this.selectScheduleId = history.state.scheduleIndex;
    this.route.paramMap.subscribe(params => {
      const eventId = Number(params.get('EventId'));
      if (eventId) {
        this.getEventActivity(eventId);
      }
    });
  }

  selectedIndex: number = 0;

  steps: { label: string; content: TemplateRef<any> | null }[] = [
    { label: 'Participants', content: null },
    { label: 'Staff', content: null }
  ];

  @ViewChild('participantTemplate', { static: false }) participantTemplate!: TemplateRef<any>;
  @ViewChild('staffTemplate', { static: false }) staffTemplate!: TemplateRef<any>;

  onClick(index: number): void {
    this.selectedIndex = index;
  }

  ngAfterViewInit(): void {
    this.steps[0].content = this.participantTemplate;
    this.steps[1].content = this.staffTemplate;
    this.cdRef.detectChanges();
  }

  getEventActivity(EventId: number) {
    this.loading = true; 
    this.eventService.getEventActivity(EventId).subscribe({
      next: (response: EventActivityDTO[]) => {
        this.participants = response.filter(activity => activity.eventUser.role === 'participant');
        this.staff = response.filter(activity => activity.eventUser.role === 'staff' || activity.eventUser.role === 'admin');
        this.loading = false; 
      },
      error: (error: any) => {
        console.error(error);
        this.loading = false; 
      }
    });
  }

  displayDateAndTime() {
    const timestamp = this.eventSchedules[this.selectScheduleId].startTime;
    const date = new Date(timestamp);

    const optionsDate: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const optionsTime: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: 'numeric', hour12: true };

    const formattedDate = new Intl.DateTimeFormat('en-US', optionsDate).format(date);
    const formattedTime = new Intl.DateTimeFormat('en-US', optionsTime).format(date);

    return `${formattedDate} ${formattedTime}`;
  }
}
