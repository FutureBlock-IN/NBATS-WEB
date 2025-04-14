import { EventScheduleResponseDTO } from "./eventScheduleResponse";
import { Event } from "./baseEvent";

export interface EventScheduleConfigResponseDTO extends Event{
    id: number;
    organizationId: number;
    eventId: number;
    createdById: number;
    startTime: string;
    endTime: string;
    duration: number;
    recurring: boolean;
    repeat: string;
    weekDays: string;
    createdOn: string;
    updatedOn: string;
    startDate: string;
    eventSchedule: EventScheduleResponseDTO[];
}