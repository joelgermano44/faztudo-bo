import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PopularServices } from './popular-services';

describe('PopularServices', () => {
  let component: PopularServices;
  let fixture: ComponentFixture<PopularServices>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopularServices],
    }).compileComponents();

    fixture = TestBed.createComponent(PopularServices);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
