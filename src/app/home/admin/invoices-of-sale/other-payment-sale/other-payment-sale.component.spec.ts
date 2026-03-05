import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherPaymentSaleComponent } from './other-payment-sale.component';

describe('OtherPaymentSaleComponent', () => {
  let component: OtherPaymentSaleComponent;
  let fixture: ComponentFixture<OtherPaymentSaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtherPaymentSaleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherPaymentSaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
