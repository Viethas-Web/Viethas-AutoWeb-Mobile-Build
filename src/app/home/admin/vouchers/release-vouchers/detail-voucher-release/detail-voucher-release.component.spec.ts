import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailVoucherReleaseComponent } from './detail-voucher-release.component';

describe('DetailVoucherReleaseComponent', () => {
  let component: DetailVoucherReleaseComponent;
  let fixture: ComponentFixture<DetailVoucherReleaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailVoucherReleaseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailVoucherReleaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
