import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseVouchersComponent } from './release-vouchers.component';

describe('ReleaseVouchersComponent', () => {
  let component: ReleaseVouchersComponent;
  let fixture: ComponentFixture<ReleaseVouchersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReleaseVouchersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReleaseVouchersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
