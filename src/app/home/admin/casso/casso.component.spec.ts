/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CassoComponent } from './casso.component';

describe('CassoComponent', () => {
  let component: CassoComponent;
  let fixture: ComponentFixture<CassoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CassoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CassoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
