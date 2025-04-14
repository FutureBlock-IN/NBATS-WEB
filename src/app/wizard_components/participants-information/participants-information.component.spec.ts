import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantsInformationComponent } from './participants-information.component';

describe('ParticipantsInformationComponent', () => {
  let component: ParticipantsInformationComponent;
  let fixture: ComponentFixture<ParticipantsInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParticipantsInformationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParticipantsInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
