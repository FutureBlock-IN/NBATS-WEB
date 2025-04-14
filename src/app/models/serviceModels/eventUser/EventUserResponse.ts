import { ResponseEventDTO } from "../event/responseEvent";

export interface OrganizationUserResponse {
    id: number;
    organizationId: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    state: string;
    city: string;
    zip: string;
    externalUserId: string;
    role: string;
    minor: boolean;
    logoUrl: string;
    createdOn: string;
  }
  
  export interface EventUserResponse {
    id: number;
    role: string;
    organizationUserResponseDTOs: OrganizationUserResponse;
  }

  
  export interface UserEventsResponse{
    id: number;
    role: string;
    event: ResponseEventDTO;
  }