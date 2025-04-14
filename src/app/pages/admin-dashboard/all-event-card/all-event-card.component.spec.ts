import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllEventCardComponent } from './all-event-card.component';

describe('AllEventCardComponent', () => {
  let component: AllEventCardComponent;
  let fixture: ComponentFixture<AllEventCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllEventCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllEventCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
