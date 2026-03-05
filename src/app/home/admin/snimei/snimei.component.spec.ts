/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SnimeiComponent } from './snimei.component';

describe('SnimeiComponent', () => {
  let component: SnimeiComponent;
  let fixture: ComponentFixture<SnimeiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SnimeiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SnimeiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
