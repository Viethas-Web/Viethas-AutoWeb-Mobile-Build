/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { WebContactComponent } from './website-contact.component';

describe('WebContactComponent', () => {
  let component: WebContactComponent;
  let fixture: ComponentFixture<WebContactComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WebContactComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
