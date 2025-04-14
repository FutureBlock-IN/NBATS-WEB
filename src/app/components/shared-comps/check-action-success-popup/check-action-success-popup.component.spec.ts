import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckActionPopupComponent } from './check-action-success-popup.component';

describe('CheckActionSuccessPopupComponent', () => {
  let component: CheckActionPopupComponent;
  let fixture: ComponentFixture<CheckActionPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckActionPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckActionPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
