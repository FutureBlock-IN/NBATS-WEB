import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventActivityDetailsComponent } from './event-activity-details.component';

describe('EventActivityDetailsComponent', () => {
  let component: EventActivityDetailsComponent;
  let fixture: ComponentFixture<EventActivityDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventActivityDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventActivityDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
