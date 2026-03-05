import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ByBillComponent } from './by-bill.component';

describe('ByBillComponent', () => {
  let component: ByBillComponent;
  let fixture: ComponentFixture<ByBillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ByBillComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ByBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
