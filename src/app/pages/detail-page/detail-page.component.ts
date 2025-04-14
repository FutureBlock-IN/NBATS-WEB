import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { UserRole } from '../../utilities/enums/user-roles.enums';
import { ThemeService } from '../../services/themes/theme.service';
import { MatIcon } from '@angular/material/icon';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-detail-page',
  standalone: true,
  imports: [MatIcon, MatSlideToggle, CommonModule],
  templateUrl: './detail-page.component.html',
  styleUrls: ['./detail-page.component.css'],
})
export class DetailPageComponent implements OnInit {
  public themeService: ThemeService = inject(ThemeService);

  constructor(private auth: AuthService, private router: Router) {}

  logoImageUrl: string | null = null;
  email: string | null = null;
  title: string | null = null;
  createdDate: string | null = null;
  editLogoUrl: string | null = null;

  ngOnInit(): void {
    const role = localStorage.getItem('role');
    if (role?.toLowerCase() == UserRole.Owner) {
      this.title = this.isValueNull(localStorage.getItem('organizationName'))
        ? 'Organization Title'
        : localStorage.getItem('organizationName');
      this.createdDate = this.isValueNull(
        localStorage.getItem('organizationCreatedDate')
      )
        ? ''
        : 'Created ' + localStorage.getItem('organizationCreatedDate');
      this.logoImageUrl = this.isValueNull(
        localStorage.getItem('organizationLogoLink')
      )
        ? 'assets/images/eventPlaceholder.jpg'
        : localStorage.getItem('organizationLogoLink');
      this.email = this.isValueNull(localStorage.getItem('email'))
        ? ''
        : localStorage.getItem('email');
    } else {
      this.title = this.isValueNull(localStorage.getItem('userFullName'))
        ? 'Organization Title'
        : localStorage.getItem('userFullName');
      this.createdDate = this.isValueNull(
        localStorage.getItem('userCreatedDate')
      )
        ? ''
        : 'Created ' + localStorage.getItem('userCreatedDate');
      this.logoImageUrl = this.isValueNull(localStorage.getItem('userLogoLink'))
        ? 'assets/images/userPlaceholder.jpg'
        : localStorage.getItem('userLogoLink');
      this.email = this.isValueNull(localStorage.getItem('email'))
        ? ''
        : localStorage.getItem('email');
    }
    console.log('Email from localStorage:', this.email);
  }

  isValueNull(value: string | null): boolean {
    if (value === null || value === 'null') {
      return true;
    }
    return false;
  }

  logout() {
    this.removeToken();
    this.auth.logout({
      logoutParams: {
        returnTo: document.location.origin,
        federated: true, // Add this line to ensure full logout
      },
    });
  }
  removeToken() {
    localStorage.removeItem('auth0-token');
  }

  toggleTheme() {
    const value = this.themeService.updateTheme();

    if (value === 'dark') {
      this.editLogoUrl = 'assets/images/edit.png';
    } else {
      this.editLogoUrl = 'assets/images/editWhite.png';
    }
  }

  dashboard() {
    this.router.navigateByUrl('/dashboard');
  }

  home() {
    this.router.navigateByUrl('/home/events');
  }
}
