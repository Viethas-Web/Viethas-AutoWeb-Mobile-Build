import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDetailInvoiceOfSaleComponent } from './edit-detail-invoice-of-sale.component';

describe('EditDetailInvoiceOfSaleComponent', () => {
  let component: EditDetailInvoiceOfSaleComponent;
  let fixture: ComponentFixture<EditDetailInvoiceOfSaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditDetailInvoiceOfSaleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditDetailInvoiceOfSaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
