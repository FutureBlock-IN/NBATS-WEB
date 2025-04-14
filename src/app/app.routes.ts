import { Routes } from '@angular/router';
import { AuthComponent } from './pages/auth/auth.component';
import { AppBarComponent } from './layouts/app-bar/app-bar.component';
import { HomeComponent } from './pages/home/home.component';
import { authGuard } from './services/guard/auth.guard';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { EventsComponent } from './pages/events/events.component';
import { StaffComponent } from './pages/staff/staff.component';
import { ParticipantsComponent } from './pages/participants/participants.component';
import { AddEventsComponent } from './pages/add-events/add-events.component';
import { AddStaffComponent } from './pages/add-staff/add-staff.component';
import { AddParticipantsComponent } from './pages/add-participants/add-participants.component';
import { AuthCallbackComponent } from './components/service-comps/auth-callback/auth-callback.component';
import { ScannerComponent } from './pages/scanner/scanner.component';
import { EventActivityComponent } from './pages/event-activity/event-activity.component';
import { EventDetailsComponent } from './pages/event-details/event-details.component';
import { DetailPageComponent } from './pages/detail-page/detail-page.component';
import { UserDetailsComponent } from './pages/user-details/user-details.component';
import { QrCodeDisplayComponent } from './qr-code-display/qr-code-display.component';
import { OrganizationApprovalPageComponent } from './organization-approval-page/organization-approval-page.component';
import { DashboardComponent } from './pages/admin-dashboard/dashboard/dashboard.component';
import { EventInformationComponent } from './wizard_components/addEventComponents/event-information/event-information.component';
import { StaffDetailsComponent } from './pages/admin-dashboard/staff-details/staff-details.component';
import { ParticipantDetailsComponent } from './pages/admin-dashboard/participant-details/participant-details.component';
import { EventActivityDetailsComponent } from './pages/admin-dashboard/event-activity-details/event-activity-details.component';
import { DashboardEventsComponent } from './pages/admin-dashboard/dashboard-events/dashboard-events.component';
import { DashboardStaffComponent } from './pages/admin-dashboard/dashboard-staff/dashboard-staff.component';
import { DashboardParticipantsComponent } from './pages/admin-dashboard/dashboard-participants/dashboard-participants.component';

export const routes: Routes = [
  {
    path: 'qr-code-display',
    component: QrCodeDisplayComponent,
  },
  {
    path: '',
    redirectTo: 'auth-redirect',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    component: AuthComponent,
  },
  {
    path: 'auth-redirect',
    component: AuthCallbackComponent,
  },
  {
    path: 'sign-up',
    component: SignUpComponent,
  },
  {
    path: '',
    component: AppBarComponent,
    children: [
      {
        path: 'home',
        component: HomeComponent,
        canActivateChild: [authGuard],
        children: [
          { path: '', redirectTo: 'events', pathMatch: 'full' },
          { path: 'events', component: EventsComponent },
          { path: 'staff', component: StaffComponent },
          { path: 'participants', component: ParticipantsComponent },
        ],
      },
      {
        path: 'detailsPage',
        component: DetailPageComponent,
        canActivate: [authGuard],
      },
      {
        path: 'home/events/addEvent',
        component: AddEventsComponent,
        canActivate: [authGuard],
      },
      {
        path: 'home/staff/addStaff',
        component: AddStaffComponent,
        canActivate: [authGuard],
      },
      {
        path: 'home/participants/addParticipants',
        component: AddParticipantsComponent,
        canActivate: [authGuard],
      },
      {
        path: 'home/user-details/:role/:UserId',
        component: UserDetailsComponent,
        canActivate: [authGuard],
      },
      {
        path: 'home/scanner',
        component: ScannerComponent,
        canActivate: [authGuard],
      },
      {
        path: 'home/eventDetails',
        component: EventDetailsComponent,
        canActivate: [authGuard],
      },
      {
        path: 'home/eventActivity/:EventId',
        component: EventActivityComponent,
        canActivate: [authGuard],
      },
      {
        path: 'eventInformation/:EventId',
        component: EventInformationComponent,
        canActivate: [authGuard],
      },
      {
        path: 'eventActivityDetails/:EventId',
        component: EventActivityDetailsComponent,
        canActivate: [authGuard],
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authGuard],
        children: [
          { path: '', redirectTo: 'events', pathMatch: 'full' },
          { path: 'events', component: DashboardEventsComponent },
          { path: 'staff', component: DashboardStaffComponent },
          { path: 'participants', component: DashboardParticipantsComponent },
        ],
      },
      {
        path: 'staff-details/:role/:UserId',
        component: StaffDetailsComponent,
        canActivate: [authGuard],
      },
      {
        path: 'participant-details/:role/:UserId',
        component: ParticipantDetailsComponent,
        canActivate: [authGuard],
      },
    ],
  },
  {
    path: 'organization-approval',
    component: OrganizationApprovalPageComponent,
  },
];
