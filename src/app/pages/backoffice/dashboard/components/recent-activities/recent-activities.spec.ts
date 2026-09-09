import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecentActivities } from './recent-activities';

describe('RecentActivities', () => {
  let component: RecentActivities;
  let fixture: ComponentFixture<RecentActivities>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentActivities],
    }).compileComponents();

    fixture = TestBed.createComponent(RecentActivities);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
