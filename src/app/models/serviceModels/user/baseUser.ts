export interface baseUser { 
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string | null;
    state: string;
    city?: string | null;
    zip?: string | null;
    externalUserId: string;
    role: string;
    minor: boolean;
    logoUrl?: string | null;
  }