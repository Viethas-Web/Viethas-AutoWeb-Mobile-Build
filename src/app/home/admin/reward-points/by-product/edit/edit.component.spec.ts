import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditByProductComponent } from './edit.component';

describe('EditByProductComponent', () => {
  let component: EditByProductComponent;
  let fixture: ComponentFixture<EditByProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditByProductComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditByProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
