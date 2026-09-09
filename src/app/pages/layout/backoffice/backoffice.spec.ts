import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BackOffice } from './backoffice';

describe('Dashboard', () => {
  let component: BackOffice;
  let fixture: ComponentFixture<BackOffice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackOffice],
    }).compileComponents();

    fixture = TestBed.createComponent(BackOffice);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
