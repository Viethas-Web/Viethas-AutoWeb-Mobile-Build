import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicesOfSaleComponent } from './invoices-of-sale.component';

describe('InvoicesOfSaleComponent', () => {
  let component: InvoicesOfSaleComponent;
  let fixture: ComponentFixture<InvoicesOfSaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoicesOfSaleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoicesOfSaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
