import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministratorConfigComponent } from './administrator-config.component';

describe('AdministratorConfigComponent', () => {
  let component: AdministratorConfigComponent;
  let fixture: ComponentFixture<AdministratorConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdministratorConfigComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministratorConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
