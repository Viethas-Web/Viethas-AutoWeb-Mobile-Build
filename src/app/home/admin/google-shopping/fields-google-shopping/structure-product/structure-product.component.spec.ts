/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { StructureProductComponent } from './structure-product.component';

describe('StructureProductComponent', () => {
  let component: StructureProductComponent;
  let fixture: ComponentFixture<StructureProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StructureProductComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StructureProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
