import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditNewFieldComponent } from './edit-new-field.component';

describe('EditNewFieldComponent', () => {
  let component: EditNewFieldComponent;
  let fixture: ComponentFixture<EditNewFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditNewFieldComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditNewFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
