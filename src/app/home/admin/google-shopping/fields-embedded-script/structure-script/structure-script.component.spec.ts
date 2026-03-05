/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { StructureScriptComponent } from './structure-script.component';

describe('StructureScriptComponent', () => {
  let component: StructureScriptComponent;
  let fixture: ComponentFixture<StructureScriptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StructureScriptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StructureScriptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
