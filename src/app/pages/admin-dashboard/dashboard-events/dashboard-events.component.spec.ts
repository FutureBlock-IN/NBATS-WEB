import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardEventsComponent } from './dashboard-events.component';

describe('DashboardEventsComponent', () => {
  let component: DashboardEventsComponent;
  let fixture: ComponentFixture<DashboardEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardEventsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
