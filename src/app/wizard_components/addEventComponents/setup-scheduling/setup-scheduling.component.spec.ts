import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupSchedulingComponent } from './setup-scheduling.component';

describe('SetupSchedulingComponent', () => {
  let component: SetupSchedulingComponent;
  let fixture: ComponentFixture<SetupSchedulingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetupSchedulingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetupSchedulingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
