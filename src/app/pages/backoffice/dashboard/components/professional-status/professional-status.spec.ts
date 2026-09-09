import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfessionalStatus } from './professional-status';

describe('ProfessionalStatus', () => {
  let component: ProfessionalStatus;
  let fixture: ComponentFixture<ProfessionalStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessionalStatus],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfessionalStatus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
