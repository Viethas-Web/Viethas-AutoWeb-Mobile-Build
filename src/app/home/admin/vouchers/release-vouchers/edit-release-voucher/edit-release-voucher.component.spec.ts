import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditReleaseVoucherComponent } from './edit-release-voucher.component';

describe('EditReleaseVoucherComponent', () => {
  let component: EditReleaseVoucherComponent;
  let fixture: ComponentFixture<EditReleaseVoucherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditReleaseVoucherComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditReleaseVoucherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
