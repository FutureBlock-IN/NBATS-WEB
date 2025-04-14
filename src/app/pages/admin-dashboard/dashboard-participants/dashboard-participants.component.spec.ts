import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardParticipantsComponent } from './dashboard-participants.component';

describe('DashboardParticipantsComponent', () => {
  let component: DashboardParticipantsComponent;
  let fixture: ComponentFixture<DashboardParticipantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardParticipantsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardParticipantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
