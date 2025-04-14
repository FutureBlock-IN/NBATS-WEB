import { baseUser } from "./baseUser";

export interface ResponseUserDTO extends baseUser {
    id: number;
    organizationId:number;
    createdOn: string;
    logoUrl: string | null;
  }