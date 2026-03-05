import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDataCustomersComponent } from './create-data-customers.component';

describe('CreateDataCustomersComponent', () => {
  let component: CreateDataCustomersComponent;
  let fixture: ComponentFixture<CreateDataCustomersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateDataCustomersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateDataCustomersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
