import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { EventCardComponent } from '../../components/service-comps/event-card/event-card.component';
import { BehaviorSubject } from 'rxjs';
import { ResponseEventDTO } from '../../models/serviceModels/event/responseEvent';
import { EventService } from '../../services/api-services/event.service';
import { AppConstants } from '../../app-Constants/app.constants';
import { CheckActionPopupComponent } from '../../components/shared-comps/check-action-success-popup/check-action-success-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { CheckInService } from '../../services/api-services/checkIn.service';
import { CheckOutService } from '../../services/api-services/checkOut.service';
import { NotificationPopupComponent } from '../../components/shared-comps/notification-popup/notification-popup.component';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { EventScheduleResponseDTO } from '../../models/serviceModels/event/eventScheduleResponse';

@Component({
  selector: 'app-scanner',
  standalone: true,
  imports: [EventCardComponent, CommonModule, ZXingScannerModule],
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ScannerComponent implements OnInit {
  currentEvent: ResponseEventDTO | null = null;
  isLoading = false;
  scanSuccess = false;
  isEventAvailable: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    true
  );
  logoUrl: string | null = null;
  name: string | null = null;
  guardianId: number | null = null;
  eventUserId: number = 0;
  eventScheduleId: number = 0;
  eventId: number = 0;
  checkInStarted = true; // Tracks if user has checked in
  checkoutStarted = false; // Tracks if user is in check-out process
  isProcessingScan = false; // Prevents multiple API calls after one scan
  isScannerActive = true; // Controls if scanner is active
  eventSchedule?: EventScheduleResponseDTO;
  eventType: string = 'Check_in';

  constructor(
    private route: ActivatedRoute,
    public eventService: EventService,
    public appConstants: AppConstants,
    private dialog: MatDialog,
    public checkInService: CheckInService,
    public checkOutService: CheckOutService,
    public router: Router,
    public location: Location
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.eventId = Number(params['eventId']);
      if (params['eventSchedule']) {
        this.eventSchedule = JSON.parse(params['eventSchedule']);
        // Retrieving the eventType
        this.eventType = params['eventType']; // Add this line to get eventType
        // Now you can use eventType for your logic
        console.log('Event Type:', this.eventType);
      }
    });
    this.eventScheduleId = this.eventSchedule?.id!;
    this.getEvent();
  }

  getEvent(): void {
    this.isLoading = true;
    this.eventService.getEventByEventId(this.eventId).subscribe(
      (responseEventDTO: ResponseEventDTO) => {
        this.currentEvent = responseEventDTO;
        this.isEventAvailable.next(true);
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching event:', error);
        this.isEventAvailable.next(false);
        this.isLoading = false;
      }
    );
  }

  handleScanSuccess(result: string) {
    // Prevent further scans if scanner is inactive or a scan is being processed
    if (!this.isScannerActive || this.isProcessingScan) {
      return;
    }

    console.log('Scan successful:', result);
    this.scanSuccess = true;
    this.isProcessingScan = true; // Set flag to prevent multiple scans
    this.isScannerActive = false; // Disable scanner until popup is closed

    try {
      const scannedData = JSON.parse(result);
      this.guardianId = scannedData.guardianId;
      this.eventUserId = scannedData.eventUserId;
      this.eventId = scannedData.eventId;
      this.logoUrl = scannedData.logoUrl;
      this.name = scannedData.name;

      if (this.eventId != this.currentEvent?.id) {
        this.showNotification('Error', 'Invalid QRCode', 'ok');
        this.isProcessingScan = false;
      } else if (this.checkInStarted && !this.checkoutStarted) {
        this.checkInUser();
      } else if (this.checkoutStarted) {
        this.performCheckOut();
      }
    } catch (error) {
      console.error('Error parsing scanned data:', error);
      this.isProcessingScan = false;
      this.isScannerActive = true;
    }
  }

  checkInUser() {
    this.checkInService
      .checkInUser(
        this.eventId,
        this.eventScheduleId,
        this.eventUserId,
        this.guardianId
      )
      .subscribe(
        () => {
          console.log('Checked in successfully');
          this.dialog
            .open(CheckActionPopupComponent, {
              data: {
                imageUrl: this.getProfilePlaceholderImageUrl(),
                name: this.name,
                message: 'Check In Completed!',
                showImage: true,
              },
            })
            .afterClosed()
            .subscribe(() => {
              this.resetScanner(); // Reset after popup is closed
            });
        },
        (error) => {
          console.error('Check-in failed', error);
          this.showNotification('Error', error, 'ok');
          this.isProcessingScan = false; // Reset flag on error
          this.isScannerActive = true; // Re-enable scanner on error
        }
      );
  }

  performCheckOut() {
    this.checkOutService
      .checkOutUser(
        this.eventId,
        this.eventScheduleId,
        this.eventUserId,
        this.guardianId
      )
      .subscribe(
        () => {
          console.log('Checked out successfully');
          this.dialog
            .open(CheckActionPopupComponent, {
              data: {
                imageUrl: this.getProfilePlaceholderImageUrl(),
                name: this.name,
                message: 'Check Out Completed!',
                showImage: true,
              },
            })
            .afterClosed()
            .subscribe(() => {
              this.resetScanner(); // Reset the scanner after check-out
            });
        },
        (error) => {
          console.error('Check-out failed', error);
          this.showNotification('Error', error, 'ok');
          this.isProcessingScan = false; // Reset flag on error
          this.isScannerActive = true; // Re-enable scanner on error
        }
      );
  }

  startCheckOut() {
    const dialogRef = this.dialog.open(CheckActionPopupComponent, {
      data: {
        imageUrl: this.logoUrl, // Path to your icon image
        name: 'Check-Out Confirmation',
        message: 'Are you sure you want to switch to the check-out phase?',
        type: 'action',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.actionConfirmed) {
        this.checkoutStarted = true;
        this.checkInStarted = false;
      }
    });
  }

  resetScanner() {
    this.isProcessingScan = false;
    this.scanSuccess = false;
    this.isScannerActive = true;
    this.name = null;
  }

  getProfilePlaceholderImageUrl(): string {
    return this.logoUrl
      ? this.logoUrl
      : this.appConstants.profilePlaceholderUrl;
  }

  endEvent() {
    const dialogRef = this.dialog.open(CheckActionPopupComponent, {
      data: {
        imageUrl: this.logoUrl,
        name: 'End Event Confirmation',
        message: 'Are you sure you want to end this event?',
        type: 'action',
        showImage: false,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.actionConfirmed) {
        if (this.eventSchedule?.inProgress)
          this.eventService
            .endEventSchedule(this.eventSchedule!.id)
            .subscribe();

        this.location.back();
      }
    });
  }

  showNotification(title: string, message: string, buttonName: string): void {
    this.dialog
      .open(NotificationPopupComponent, {
        data: {
          title,
          message,
          buttonName,
        },
      })
      .afterClosed()
      .subscribe(() => {
        this.isScannerActive = true;
      });
  }
}
