import { Component, computed, inject, signal } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MatIconButton } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Location } from '@angular/common';
import { filter } from 'rxjs';
import { EmailCheckService } from '../../services/api-services/emailCheck.service';
import { LoginUser } from '../../models/authModels/LoginUser';
import { AppConstants } from '../../app-Constants/app.constants';
import { CommonModule } from '@angular/common';
import { StaffAccessValidator } from '../../utilities/validators/staff-access-validators';
import { UserRole } from '../../utilities/enums/user-roles.enums';
import { ThemeService } from '../../services/themes/theme.service';

@Component({
  selector: 'app-app-bar',
  standalone: true,
  templateUrl: './app-bar.component.html',
  styleUrls: ['./app-bar.component.css'],
  imports: [
    MatToolbar,
    MatIcon,     
    RouterOutlet,    
    MatSidenavModule,
    CommonModule,
  ],
})
export class AppBarComponent {
  titleName: string = '';
  organizationName: string = '';
  iconType: string = '';   
  showAddIcon: boolean = false;
  logoImageUrl: string | null = null;
  showLogoImage: boolean = false;
  editLogoUrl: string | null = null;
  showEditLogo: boolean = false;
  currentRoute:string = ''

  private routesWithMenuIcon = [
    '/dashboard/events',
    '/dashboard/staff',
    '/dashboard/participants',
  ];
  public emailCheckService: EmailCheckService = inject(EmailCheckService);

  constructor(
    private router: Router,
    private location: Location,
    public appConstants: AppConstants,
    public staffAccessValidator: StaffAccessValidator,
    public themeService: ThemeService
  ) {
    this.updateTitleBasedOnRoute();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
        this.updateTitleBasedOnRoute();
      });
  }
  authEmail: string = '';
  ngOnInit() {

     this.currentRoute = this.router.url;
     
    const role = localStorage.getItem('role');
    if (role?.toLowerCase() == UserRole.Owner) {
      this.logoImageUrl = localStorage.getItem('organizationLogoLink');
      if (this.logoImageUrl === 'null')
        this.logoImageUrl = 'assets/images/eventPlaceholder.jpg';
    } else {
      this.logoImageUrl = localStorage.getItem('userLogoLink');
      if (this.logoImageUrl === 'null')
        this.logoImageUrl = 'assets/images/userPlaceholder.jpg';
    }
    this.editLogoUrl = 'assets/images/edit.png';
    this.getAuthEmail();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateTitleBasedOnRoute();
      });

    // Fetch email data on initialization
    this.emailCheckService.checkEmail(this.authEmail).subscribe({
      next: (response: LoginUser[]) => {
        if (response.length > 0) {
          this.organizationName = response[0]?.organization?.name || '';
          this.updateTitleBasedOnRoute();
        }
      },
      error: (error: any) => {
        console.error(error);
      },
    });
  }

  navigateToNewPage() {
    this.router.navigate([this.appConstants.DetailPageRoute]);
  }

  navigateToHomePage() {
    this.router.navigate([this.appConstants.eventsTabRoute]);
  }

  getAuthEmail() {
    const email = localStorage.getItem('auth-email');
    if (email) {
      this.authEmail = email;
    }
  }

  updateTitleBasedOnRoute(): void {
    const currentRoute = this.router.url;
    
    function getRoute(route: string) {
      if (currentRoute.includes(route)) return currentRoute;
      return route;
    }
  
    // Default values for icon type and visibility
    this.iconType = '';  
    this.showAddIcon = false;
    this.showLogoImage = true;
    this.showEditLogo = false;

    switch (currentRoute) {
      case '/home/events/addEvent':
        this.titleName = 'Add Event';
        this.showAddIcon = false;
        this.showLogoImage = true;
        this.showEditLogo = false;
        this.iconType = 'keyboard_arrow_left';
        break;
      case '/home/staff/addStaff':
        this.titleName = 'Add Staff';
        this.showAddIcon = false;
        this.showLogoImage = true;
        this.showEditLogo = false;
        break;
      case '/home/participants/addParticipants':
        this.titleName = 'Add Participant';
        this.showAddIcon = false;
        this.showLogoImage = true;
        this.showEditLogo = false;
        break;
      case '/home/events':
      case '/home/staff':
      case '/home/participants':
        this.titleName = this.organizationName;
        this.showLogoImage = true;
        this.showAddIcon = true;
        this.showEditLogo = false;
        // this.iconType = '';
        break;
      case '/home/eventDetails':
        this.titleName = 'Event Details';
        this.showLogoImage = true;
        this.showAddIcon = false;
        this.showEditLogo = true;
        break;
      case '/detailsPage':
        this.titleName = 'Details';
        this.showAddIcon = false;
        this.showLogoImage = false;
        this.showEditLogo = false;
        break;
      case getRoute('/home/user-details/s'):
        this.titleName = 'Staff Details';
        this.showLogoImage = true;
        this.showAddIcon = false;
        this.showEditLogo = true;
        // this.iconType = '';
        break;
      case getRoute('/home/user-details/p'):
        this.titleName = 'Participant Details';
        this.showLogoImage = true;
        this.showAddIcon = false;
        this.showEditLogo = true;
        // this.iconType = '';
        break;
      case getRoute('/dashboard'):
        this.titleName = 'Dashboard';        
        this.showLogoImage = true;
        this.showAddIcon = false;
        this.showEditLogo = true;
        this.iconType = 'keyboard_arrow_left';
        break;
        case getRoute('/dashboard/eventActivityDetails'):
        this.titleName = 'Dashboard';
        this.showLogoImage = true;
        this.showAddIcon = false;
        this.showEditLogo = true;
        break;
      default:
        this.titleName = '';
        this.showAddIcon = false;
        this.showLogoImage = true;
        this.showEditLogo = false;
        break;
    }

     
  // Handling icon visibility based on route
  if (
    currentRoute.includes('/home/events') ||
    currentRoute.includes('/home/staff') ||
    currentRoute.includes('/home/participants') ||
    currentRoute.includes('/dashboard') // Prevent back icon on dashboard
  ) {
    this.iconType = ''; // Don't show the back icon
  } else {
    this.iconType = 'keyboard_arrow_left'; // Show the back icon
  }

  // Additional logic for specific routes
  if (currentRoute.includes('/home/events/addEvent') || currentRoute.includes('/home/staff/addStaff') || currentRoute.includes('/home/participants/addParticipants')) {
    this.iconType = 'keyboard_arrow_left';  // Show back icon on add pages
  }


 

   
  // if (currentRoute.includes('/home/events/addEvent') || currentRoute.includes('/home/staff/addStaff') || currentRoute.includes('/home/participants/addParticipants')) {
  //   this.iconType = 'keyboard_arrow_left';   
  // } else {
     
  // }
  


  // if (currentRoute.includes('/dashboard') || currentRoute.includes('/home/staff/addStaff') || currentRoute.includes('/home/participants/addParticipants')) {
  //   this.iconType = '';   
  // } else {
     
  // }
   
  }

  collapsed = signal(false);
  sidenavwidth = computed(() => (this.collapsed() ? '65px' : '200px'));

  goBack() {
    this.location.back();
  }

  handleAddIconClick(): void {
    const currentRoute = this.router.url;

    switch (true) {
      case currentRoute.includes(this.appConstants.eventsTabRoute):
        this.router.navigate([this.appConstants.addEventPageRoute]);
        break;
      case currentRoute.includes(this.appConstants.staffTabRoute):
        this.staffAccessValidator.navigateToAddStaff();
        break;
      case currentRoute.includes(this.appConstants.participantsTabRoute):
        this.router.navigate([this.appConstants.addParticipantsPageRoute]);
        break;
      default:
        break;
    }
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']); // This will navigate to /dashboard
  }

  // Navigate to the Home page when clicking the Home link
  goToHome() {
    this.router.navigate(['/home/events']); // This will navigate to /home
  }
}
