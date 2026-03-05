import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailCouponComponent } from './detail-coupon.component';

describe('DetailCouponComponent', () => {
  let component: DetailCouponComponent;
  let fixture: ComponentFixture<DetailCouponComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailCouponComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailCouponComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
