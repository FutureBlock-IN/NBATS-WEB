import { ResponseUserDTO } from '../user/responseUser';

export interface EventUserDTO {
  id: number;
  role: string;
}

export interface EventActivityDTO {
  checkInTime: string;
  checkOutTime: string | null;
  eventUser: EventUserDTO;
  organzationUser: ResponseUserDTO;
}

export interface ResponseEventDTo {
  id: number;
  title: string;
  startDate: string;
}
