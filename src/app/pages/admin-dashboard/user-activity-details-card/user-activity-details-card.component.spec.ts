import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserActivityDetailsCardComponent } from './user-activity-details-card.component';

describe('UserActivityDetailsCardComponent', () => {
  let component: UserActivityDetailsCardComponent;
  let fixture: ComponentFixture<UserActivityDetailsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserActivityDetailsCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserActivityDetailsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
