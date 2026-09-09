import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderFlow } from './order-flow';

describe('OrderFlow', () => {
  let component: OrderFlow;
  let fixture: ComponentFixture<OrderFlow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderFlow],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderFlow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
