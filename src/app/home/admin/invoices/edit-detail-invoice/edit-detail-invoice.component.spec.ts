import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDetailInvoiceComponent } from './edit-detail-invoice.component';

describe('EditDetailInvoiceComponent', () => {
  let component: EditDetailInvoiceComponent;
  let fixture: ComponentFixture<EditDetailInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditDetailInvoiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditDetailInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
