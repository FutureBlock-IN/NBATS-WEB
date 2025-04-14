import { Component, inject, OnInit } from '@angular/core';
import { InputButtonComponent } from '../../components/shared-comps/input-button/input-button.component';
import { IconButtonComponent } from '../../components/shared-comps/icon-button/icon-button.component';
import { GlobalButtonComponent } from '../../components/service-comps/global-button/global-button.component';
import { GlobalInputComponent } from '../../components/shared-comps/global-input/global-input.component';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '@auth0/auth0-angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from '../../services/themes/theme.service';
import { MatInput } from '@angular/material/input';
import { Router, RouterOutlet } from '@angular/router';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [InputButtonComponent ,MatIconButton ,MatIconModule ,IconButtonComponent ,RouterLink, GlobalButtonComponent, GlobalInputComponent, MatButtonModule, CommonModule, FormsModule, MatInput, RouterOutlet],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent implements OnInit {
  isDarkMode:boolean = true;
  accessToken: string = '';
  idToken: any = '';
  user: any;
  ownerOrganization: string = ''
  email: string = '';
  password: string = '';
  themeService:ThemeService = inject(ThemeService)
  isLoading= false;
  constructor(public auth: AuthService , private router:Router) { }

  ngOnInit() {
    this.auth.user$.subscribe(user => {
      this.user = user;
      if (user) {
        // this.getToken();
        // this.getIdToken();
      }
    });
  }
  UserRegistrationAuth0() {
    this.isLoading = false;
    this.auth.loginWithRedirect({
      appState: { target: '/auth-redirect' }
    });
    this.isLoading = true;
  }
  onGoogleSignin(){
    this.UserRegistrationAuth0()
  }
  toggleTheme(){
    this.themeService.updateTheme();
    if(this.themeService.themeSignal() === 'dark'){
      this.isDarkMode = true
    }else{
      this.isDarkMode = false
    }
  }
  getToken() {
    this.auth.getAccessTokenSilently().subscribe(
      (token) => {
        console.log('Access Token:', token);
        this.accessToken = token;
        localStorage.setItem("auth0-token",token)
      },
      (error) => {
        console.error('Error getting token:', error);
      }
    );
  }
  getIdToken() {
    this.auth.idTokenClaims$.subscribe(
      (claims) => {
        if (claims) {
          this.idToken = claims
          console.log('ID Token Claims:', claims);
          // You can access specific claims like this:
          console.log('User email:', claims.email);
        }
      },
      (error) => console.error('Error getting ID token claims:', error)
    );
  }
  logout() {
    this.auth.logout({
      logoutParams: {
        returnTo: document.location.origin,
      }
    });
  }
}