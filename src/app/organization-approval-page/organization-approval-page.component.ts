import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../environments/environment.development';

@Component({
  selector: 'app-organization-approval-page',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './organization-approval-page.component.html',
  styleUrls: ['./organization-approval-page.component.css']
})
export class OrganizationApprovalPageComponent implements OnInit {
  isLoading = false;
  message: string | null = null;
  organizationName: string | null = null;
  isError = false;
  private apiUrl = `${environment.ApiUrl.uri}`;

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const key = params['key'];
      if (key) {
        this.approveOrganization(key);
      }
    });
  }

  approveOrganization(key: string): void {
    this.isLoading = true;
    this.http.post<{ id: number; name: string; logoLink: string; createdDate: string; status: string }>(
      `${this.apiUrl}/api/organization/approve-organization`,
      { key }
    ).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.organizationName = response.name;
        this.message = `The organization "${this.organizationName}" has been successfully approved.`;
        this.isError = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.message = error?.error?.error || 'An error occurred during the approval process. Please try again.';
        this.isError = true;
      }
    });
  } 
}
