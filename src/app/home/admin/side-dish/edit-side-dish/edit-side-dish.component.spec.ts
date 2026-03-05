/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EditSideDishComponent } from './edit-side-dish.component';

describe('EditSideDishComponent', () => {
  let component: EditSideDishComponent;
  let fixture: ComponentFixture<EditSideDishComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditSideDishComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSideDishComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
