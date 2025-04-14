import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserActivityCardComponent } from './user-activity-card.component';

describe('UserActivityCardComponent', () => {
  let component: UserActivityCardComponent;
  let fixture: ComponentFixture<UserActivityCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserActivityCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserActivityCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
