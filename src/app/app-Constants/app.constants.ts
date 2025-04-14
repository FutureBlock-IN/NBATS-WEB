import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AppConstants {
  public admin: string = 'admin';
  public eventsTabRoute: string = '/home/events';
  public staffTabRoute: string = '/home/staff';
  public participantsTabRoute: string = '/home/participants';
  public addEventPageRoute: string = '/home/events/addEvent';
  public addStaffPageRoute: string = '/home/staff/addStaff';
  public addParticipantsPageRoute: string =
    '/home/participants/addParticipants';
  public DetailPageRoute: string = '/detailsPage';
  public userDetailsPageRoute: string = '/home/user-details';
  public eventDetailsPageRoute: string = '/home/eventDetails';

  public events: string = 'events';
  public participants: string = 'participants';
  public participant: string = 'participant';
  public staff: string = 'staff';
  public dateFormat: string = 'M/d/yyyy';
  public locale: string = 'en-US';
  public errorFetchingParticipants: string = 'Error fetching participants:';
  public errorFetchingStaff: string = 'Error fetching staff:';
  public signup: string = 'signup';
  public participantCreatedSuccessfully: string =
    'Participant created successfully';
  public staffCreatedSuccessfully: string = 'Staff created successfully';
  public eventCreatedSuccessfully: string = 'Event created successfully';
  public participantDataIsUndefined: string = 'Participant data is undefined';
  public eventUpdatedSuccessfully: string = 'Event updated successfully';
  public eventAssignmentUpdatedForStaff: string =
    'Event assignment updated for staff';
  public eventAssignmentUpdatedForParticipant: string =
    'Event assignment updated for participant';
  public active = 'active';
  public organizationUnderReview = 'Your organization is under review';
  public organizationUnderReviewMessage = 'Please contact admin@entryzap.com.';

  public profilePlaceholderUrl: string =
    '../../../../assets/images/userPlaceholder.jpg';

  public organizationUserContainerName = 'organization-user-logos';
}
