export class SignUpData {
    email: string;
    password: string;
    confirmPassword: string;
    contactNumber: number;
    name: string;
    organizationName: string;
  
    constructor(
      email: string,
      password: string,
      confirmPassword: string,
      name: string,
      contactNumber: number,
      organizationName: string
    ) {
      this.email = email;
      this.password = password;
      this.confirmPassword = confirmPassword;
      this.name = name;
      this.contactNumber = contactNumber;
      this.organizationName = organizationName;
    }
  }
  