import { EventScheduleConfigResponseDTO } from './eventScheduleConfigResponse';
import { Event } from './baseEvent';

export interface MainResponseEvent extends Event {
  id: number;
  createdOn: string;
  updatedOn: string;
  eventScheduleConfig?: EventScheduleConfigResponseDTO;
}
