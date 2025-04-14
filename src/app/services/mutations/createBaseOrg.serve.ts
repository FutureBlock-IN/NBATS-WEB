import { convertUtcToIst } from '../../utilities/extensions/convert-utc-to-ist';

export function   setInLocalStorage(response: any): Promise<void> {

    return new Promise<void>((resolve) => {
        localStorage.setItem('role', response.role);
        localStorage.setItem('organizationId', response.organization.id);
        localStorage.setItem('email', response.email);
        localStorage.setItem('organizationName', response.organization.name);
        localStorage.setItem('organizationLogoLink', response.organization.logoLink);
        const organizationCreatedDate = response.organization.createdDate ? convertUtcToIst(response.organization.createdDate) : 'N/A';
        localStorage.setItem('organizationCreatedDate', organizationCreatedDate);
        localStorage.setItem('userFullName', response.firstName + ' ' + response.lastName);
        localStorage.setItem('userLogoLink', response.logoUrl);
        const userCreatedDate = response.createdOn ? convertUtcToIst(response.createdOn) : 'N/A';
        localStorage.setItem('userCreatedDate', userCreatedDate);
        resolve();
    });
  }