import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailInvoiceOfSaleComponent } from './detail-invoice-of-sale.component';

describe('DetailInvoiceOfSaleComponent', () => {
  let component: DetailInvoiceOfSaleComponent;
  let fixture: ComponentFixture<DetailInvoiceOfSaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailInvoiceOfSaleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailInvoiceOfSaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
