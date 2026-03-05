import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddByBillComponent } from './add.component';

describe('AddByBillComponent', () => {
  let component: AddByBillComponent;
  let fixture: ComponentFixture<AddByBillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddByBillComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddByBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
