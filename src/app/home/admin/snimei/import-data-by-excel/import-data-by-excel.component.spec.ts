import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportDataByExcelComponent } from './import-data-by-excel.component';

describe('ImportDataByExcelComponent', () => {
  let component: ImportDataByExcelComponent;
  let fixture: ComponentFixture<ImportDataByExcelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportDataByExcelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportDataByExcelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
