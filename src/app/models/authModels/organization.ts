export interface Organization {
  name: string;
  logoLink?: string | null;
}
export interface OrganizationUser {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string | null;
  state?: string | null;
  city?: string | null;
  zip?: string | null;
  externalUserId: string;
}
export interface OrganizationData {
  organization: Organization;
  organizationUser: OrganizationUser;
}


