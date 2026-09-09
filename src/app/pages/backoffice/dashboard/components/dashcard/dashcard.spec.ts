import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Dashcard } from './dashcard';

describe('Dashcard', () => {
  let component: Dashcard;
  let fixture: ComponentFixture<Dashcard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashcard],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashcard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
