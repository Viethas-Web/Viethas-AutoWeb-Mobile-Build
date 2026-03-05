import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseCouponsComponent } from './release-coupons.component';

describe('ReleaseCouponsComponent', () => {
  let component: ReleaseCouponsComponent;
  let fixture: ComponentFixture<ReleaseCouponsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReleaseCouponsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReleaseCouponsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
