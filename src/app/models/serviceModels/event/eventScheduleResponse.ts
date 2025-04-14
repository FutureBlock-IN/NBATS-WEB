import { EventScheduleConfigResponseDTO } from './eventScheduleConfigResponse';

export interface EventScheduleResponseDTO
  extends EventScheduleConfigResponseDTO {
  id: number;
  startTime: string;
  endTime: string;
  checkoutStartedTime: string;
  inProgress: boolean;
  checkoutEndedTime: string;
  formattedStartTime: string;
  formattedEndTime: string;
  formattedDate: string;
}
