import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircularStepperComponent } from './circular-stepper.component';

describe('CircularStepperComponent', () => {
  let component: CircularStepperComponent;
  let fixture: ComponentFixture<CircularStepperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CircularStepperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CircularStepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
