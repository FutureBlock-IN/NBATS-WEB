import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { EventsComponent } from '../events/events.component';
import { StaffComponent } from '../staff/staff.component';
import { ParticipantsComponent } from '../participants/participants.component';
import { MatIcon } from '@angular/material/icon';
import { AppConstants } from '../../app-Constants/app.constants';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    EventsComponent,
    StaffComponent,
    ParticipantsComponent,
    RouterModule,
    MatIcon
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  currentTab: string = this.appConstants.events;

  constructor(private router: Router,private appConstants: AppConstants,private auth: AuthService) {}
  accessToken:string='';
  ngOnInit(): void {
  //  this.getAccessToken();
    this.updateCurrentTab(this.router.url);
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {
        this.updateCurrentTab(event.urlAfterRedirects);
      });
  }
  getAccessToken(){
    this.auth.getAccessTokenSilently().subscribe(
      (token) => {
        console.log('Access Token:', token);
        this.accessToken = token;
        localStorage.setItem("auth0-accessToken",token)
      },
      (error) => {
        console.error('Error getting token:', error);
      }
    );
  }

  private updateCurrentTab(url: string): void {
    switch (true) {
      case url.includes(this.appConstants.eventsTabRoute):
        this.currentTab = this.appConstants.events;
        break;
      case url.includes(this.appConstants.staffTabRoute):
        this.currentTab = this.appConstants.staff;
        break;
      case url.includes(this.appConstants.participantsTabRoute):
        this.currentTab = this.appConstants.participants;
        break;
      default:
        this.currentTab = this.appConstants.events;
    }
  }

  setCurrentTab(tab: string): void {
    this.currentTab = tab;
    console.log(this.currentTab);
  }

}
