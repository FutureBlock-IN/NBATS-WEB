import { Event } from './baseEvent';
import { EventScheduleResponseDTO } from './eventScheduleResponse';

export interface ResponseEventDTO extends Event {
  id: number;
  createdOn: string;
  updatedOn: string;
  startDate: string;
  startTime: string;
  endTime: string;
  eventSchedule?: EventScheduleResponseDTO;
  roles?: {
    staff: number;
    participants: number;
    admins: number;
  };
}
