import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TitleHeader } from './title-header';

describe('TitleHeader', () => {
  let component: TitleHeader;
  let fixture: ComponentFixture<TitleHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TitleHeader],
    }).compileComponents();

    fixture = TestBed.createComponent(TitleHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
