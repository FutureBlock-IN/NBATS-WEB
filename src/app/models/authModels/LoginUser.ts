import { baseUser } from "../serviceModels/user/baseUser";
import { Organization } from "./organization";

export interface LoginUser extends baseUser {
    id: number;
    organization: Organization;
    createdOn: string;
  }