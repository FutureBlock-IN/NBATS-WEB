import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { EmailCheckService } from '../../../services/api-services/emailCheck.service';
import { setInLocalStorage } from '../../../services/mutations/createBaseOrg.serve';
import { AuthDataService } from '../../../services/auth/AuthData.service';
import { ActivatedRoute } from '@angular/router';
import { AppConstants } from '../../../app-Constants/app.constants';
import { NotificationPopupComponent } from '../../shared-comps/notification-popup/notification-popup.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [],
  templateUrl: './auth-callback.component.html',
  styleUrl: './auth-callback.component.css',
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private emailService: EmailCheckService,
    private authDataService: AuthDataService,
    private appConstants: AppConstants,
    private dialog: MatDialog
  ) {}

  email: string = '';
  isAuthenticated: boolean = false;

  ngOnInit(): void {
    const fullUrl = this.router.url;

    if (fullUrl.includes('/auth-redirect')) {
      const queryParams = new URLSearchParams(
        this.route.snapshot.queryParams as any
      );

      if (queryParams.has('encodedkey'))
        this.handleEncodedData(String(queryParams.get('encodedkey')));

      if (queryParams.has('email')) {
        // Handle the case where email is directly in the URL
        this.email = queryParams.get('email') || '';
        const role = queryParams.get('role') || '';
        const screen_hint = queryParams.get('screen_hint') || '';

        localStorage.setItem('auth-email', this.email);
        localStorage.setItem('user-role', role);

        if (screen_hint === this.appConstants.signup)
          this.redirectToAuth0SignUpPage();

        this.checkUserEmail();
      } else if (queryParams.has('code') && queryParams.has('state')) {
        // Handle the case with Auth0 callback parameters
        this.handleAuth0Callback();
      } else {
        // Handle any other unexpected cases
        console.error('Unexpected URL structure');
        this.checkAuthenticationStatus();
      }
    } else {
      // Fallback to checking authentication if no 'auth-redirect' in URL
      this.checkAuthenticationStatus();
    }
  }

  handleAuth0Callback() {
    // Wait for Auth0 to complete its process
    this.auth.isAuthenticated$.subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        this.getAuth0token();
      } else {
        // If not authenticated after callback, something went wrong
        console.error('Authentication failed after callback');
        this.redirectToLoginPage();
      }
    });
  }

  handleEncodedData(encodedData: string) {
    try {
      const cleanedData = encodedData.replace(/=+$/, '');

      const padding = '='.repeat((4 - (cleanedData.length % 4)) % 4);
      const paddedData = cleanedData + padding;

      const decodedData = atob(paddedData);

      const params = new URLSearchParams(decodedData);

      this.email = params.get('email') || '';
      const role = params.get('role') || '';
      const screen_hint = params.get('screen_hint') || '';

      localStorage.setItem('auth-email', this.email);
      localStorage.setItem('user-role', role);

      if (screen_hint === this.appConstants.signup)
        this.redirectToAuth0SignUpPage();
    } catch (error) {
      console.error('Error decoding data:', error);
      console.error('Original encoded data:', encodedData);
      this.checkAuthenticationStatus();
    }
  }
  OpenAuth0(hint: string) {
    const emailToRedirect =
      this.email || localStorage.getItem('auth-email') || '';
    const url = `/auth-redirect?email=${emailToRedirect}&role=staff&screen_hint=${hint}`;
    this.auth.loginWithRedirect({
      appState: { target: url },
    });
  }

  checkAuthenticationStatus() {
    this.auth.isAuthenticated$.subscribe(
      (isAuthenticated) => {
        this.isAuthenticated = isAuthenticated;
        if (isAuthenticated) {
          this.getAuth0token();
        } else {
          this.handleLogout();
        }
      },
      (error) => {
        console.error('Error checking authentication status:', error);
        this.redirectToLoginPage();
      }
    );
  }

  getAuthTokenIDClaims() {
    this.auth.idTokenClaims$.subscribe(
      (claims) => {
        if (claims && claims.email) {
          localStorage.setItem('auth-email', claims.email);
          this.email = claims.email;
          this.checkUserEmail();
        } else {
          console.error('No email found in ID token claims');
          this.redirectToSignUpPage();
        }
      },
      (error) => {
        console.error('Error getting ID token claims:', error);
        this.redirectToLoginPage();
      }
    );
  }

  getAuth0token() {
    this.auth.getAccessTokenSilently().subscribe({
      next: (token) => {
        this.getAuthTokenIDClaims();
        this.storeAuth0Token(token);
      },
      error: (error) => {
        console.error('Error getting access token:', error);
        this.redirectToLoginPage();
      },
    });
  }

  storeAuth0Token(token: string) {
    localStorage.setItem('auth0-token', token);
  }

  checkUserEmail() {
    const emailToCheck = this.email || localStorage.getItem('auth-email') || '';
    this.emailService.checkEmail(emailToCheck).subscribe({
      next: (value) => {
        const user = value[0];
        if (user) {
          if (user.organization.status === this.appConstants.active) {
            // User is active, continue with login flow
            setInLocalStorage(user).then(() => {
              this.authDataService.initialize().then(() => {
                this.redirectToHomePage();
              });
            });
          } else {
            // Organization is under review, show a notification
            console.log('Organization is under review. Showing notification.');
            this.showNotification(
              this.appConstants.organizationUnderReview,
              this.appConstants.organizationUnderReviewMessage,
              'Ok'
            )
              .afterClosed()
              .subscribe(() => {
                console.log('Notification dialog closed. Logging out.');
                this.auth.logout({
                  logoutParams: {
                    returnTo: document.location.origin,
                  },
                });
              });

            // Ensure no further execution happens
            return;
          }
        } else {
          console.error('No user found in response.');
          this.redirectToSignUpPage();
        }
      },
      error: (err) => {
        console.error('Error checking user email:', err);
        this.redirectToSignUpPage();
      },
    });
  }

  handleLogout() {
    this.removeToken();
    setTimeout(() => {
      this.redirectToLoginPage();
    }, 3000);
  }
  removeToken() {
    localStorage.removeItem('auth0-token');
    localStorage.removeItem('auth-email');
  }
  redirectToSignUpPage() {
    this.router.navigate(['/sign-up']);
  }

  redirectToHomePage() {
    this.router.navigateByUrl('/home');
  }

  redirectToLoginPage() {
    this.router.navigateByUrl('/auth');
  }

  redirectToAuth0SignUpPage() {
    this.auth.loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup',
        login_hint: this.email,
      },
    });
  }

  showNotification(title: string, message: string, buttonName: string) {
    return this.dialog.open(NotificationPopupComponent, {
      data: {
        title,
        message,
        buttonName,
      },
    });
  }
}
