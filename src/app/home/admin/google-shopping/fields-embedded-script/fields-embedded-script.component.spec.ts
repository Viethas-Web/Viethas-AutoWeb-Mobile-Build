/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { FieldsEmbeddedScriptComponent } from './fields-embedded-script.component';

describe('FieldsEmbeddedScriptComponent', () => {
  let component: FieldsEmbeddedScriptComponent;
  let fixture: ComponentFixture<FieldsEmbeddedScriptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldsEmbeddedScriptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldsEmbeddedScriptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
