/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EditSnimeiComponent } from './edit-snimei.component';

describe('EditSnimeiComponent', () => {
  let component: EditSnimeiComponent;
  let fixture: ComponentFixture<EditSnimeiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditSnimeiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSnimeiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
