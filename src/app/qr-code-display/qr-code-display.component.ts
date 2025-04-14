import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../environments/environment.production';
@Component({
  selector: 'app-qr-code-display',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './qr-code-display.component.html',
  styleUrls: ['./qr-code-display.component.css']
})
export class QrCodeDisplayComponent implements OnInit {
  qrCodeImage: SafeUrl | null = null;
  errorMessage: string | null = null;
  private qrCodeBlob: Blob | null = null;
  isLoading = false;
  private apiUrl = `${environment.ApiUrl.uri}`;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      if (code) {
        this.fetchQrCode(code);
      } else {
        this.errorMessage = 'No QR code specified. Please add a "code" parameter to the URL.';
      }
    });
  }

  downloadImage(): void {
    if (this.qrCodeBlob) {
      const url = window.URL.createObjectURL(this.qrCodeBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'qr-code.png';
      link.click();
      window.URL.revokeObjectURL(url);
    }
  }

  private fetchQrCode(code: string): void {
    const qrCodeUrl = `${this.apiUrl}/api/QR/download?key=${encodeURIComponent(code)}`;
    this.isLoading = true;

    this.http.get(qrCodeUrl, { responseType: 'blob' }).subscribe({
      next: (blob: Blob) => {
        this.qrCodeBlob = blob;
        const imageUrl = URL.createObjectURL(blob);
        this.qrCodeImage = this.sanitizer.bypassSecurityTrustUrl(imageUrl);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching QR code:', error);
        this.errorMessage = 'Error loading QR code. Please try again.';
        this.isLoading = false;
      }
    });
  }
}