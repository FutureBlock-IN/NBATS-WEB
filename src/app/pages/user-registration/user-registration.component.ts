import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { OnInit } from '@angular/core';
import { authAPI } from '../../services/auth/authAPI.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-user-registration',
  standalone: true,
  imports: [FormsModule, MatSlideToggleModule, CommonModule],
  templateUrl: './user-registration.component.html',
  styleUrl: './user-registration.component.css'
})
export class UserRegistrationComponent implements OnInit{
  constructor(private authAPIservice:authAPI, private router:Router){}
  isAttendee: boolean = false;
  ownerOrganization: string = '';
  password: string = '';
  email: string = '';
  name: string = '';
  onSubmit() {
    this.router.navigateByUrl('/dashboard')
  }
  ngOnInit() {
    
  }
}