export class Attendee {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  registeredDate: Date;

  constructor(id: number, name: string, email: string, phoneNumber: string,
    registeredDate: Date) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.registeredDate = registeredDate;
  }
}