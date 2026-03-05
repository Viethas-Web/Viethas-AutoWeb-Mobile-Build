import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditByBillComponent } from './edit.component';

describe('EditByBillComponent', () => {
  let component: EditByBillComponent;
  let fixture: ComponentFixture<EditByBillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditByBillComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditByBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
