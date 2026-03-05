import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddByProductComponent } from './add.component';

describe('AddByProductComponent', () => {
  let component: AddByProductComponent;
  let fixture: ComponentFixture<AddByProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddByProductComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddByProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
