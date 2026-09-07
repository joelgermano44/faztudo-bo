import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HowItWork } from './how-it-work';

describe('HowItWork', () => {
  let component: HowItWork;
  let fixture: ComponentFixture<HowItWork>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HowItWork],
    }).compileComponents();

    fixture = TestBed.createComponent(HowItWork);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
