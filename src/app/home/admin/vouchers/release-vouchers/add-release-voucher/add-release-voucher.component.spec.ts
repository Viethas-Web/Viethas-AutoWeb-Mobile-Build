import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddReleaseVoucherComponent } from './add-release-voucher.component';

describe('AddReleaseVoucherComponent', () => {
  let component: AddReleaseVoucherComponent;
  let fixture: ComponentFixture<AddReleaseVoucherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddReleaseVoucherComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddReleaseVoucherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
