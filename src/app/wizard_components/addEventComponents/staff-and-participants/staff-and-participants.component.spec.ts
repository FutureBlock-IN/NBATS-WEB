import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffAndParticipantsComponent } from './staff-and-participants.component';

describe('StaffAndParticipantsComponent', () => {
  let component: StaffAndParticipantsComponent;
  let fixture: ComponentFixture<StaffAndParticipantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffAndParticipantsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffAndParticipantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
