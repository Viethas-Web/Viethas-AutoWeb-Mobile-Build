import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HosingConfigComponent } from './hosting-config.component';

describe('HosingConfigComponent', () => {
  let component: HosingConfigComponent;
  let fixture: ComponentFixture<HosingConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HosingConfigComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HosingConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
