import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationApprovalPageComponent } from './organization-approval-page.component';

describe('OrganizationApprovalPageComponent', () => {
  let component: OrganizationApprovalPageComponent;
  let fixture: ComponentFixture<OrganizationApprovalPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationApprovalPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationApprovalPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
