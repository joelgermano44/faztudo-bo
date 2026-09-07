import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WhatWeOffer } from './what-we-offer';

describe('WhatWeOffer', () => {
  let component: WhatWeOffer;
  let fixture: ComponentFixture<WhatWeOffer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatWeOffer],
    }).compileComponents();

    fixture = TestBed.createComponent(WhatWeOffer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
