/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SideDishComponent } from './side-dish.component';

describe('SideDishComponent', () => {
  let component: SideDishComponent;
  let fixture: ComponentFixture<SideDishComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SideDishComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SideDishComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
