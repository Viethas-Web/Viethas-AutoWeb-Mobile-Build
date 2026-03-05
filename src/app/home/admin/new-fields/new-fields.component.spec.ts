import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewFieldsComponent } from './new-fields.component';

describe('NewFieldsComponent', () => {
  let component: NewFieldsComponent;
  let fixture: ComponentFixture<NewFieldsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewFieldsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
