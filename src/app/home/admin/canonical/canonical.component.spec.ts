/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CanonicalComponent } from './canonical.component';

describe('CanonicalComponent', () => {
  let component: CanonicalComponent;
  let fixture: ComponentFixture<CanonicalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CanonicalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CanonicalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
