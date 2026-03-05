import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailVoucherComponent } from './detail-voucher.component';

describe('DetailVoucherComponent', () => {
  let component: DetailVoucherComponent;
  let fixture: ComponentFixture<DetailVoucherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailVoucherComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailVoucherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
