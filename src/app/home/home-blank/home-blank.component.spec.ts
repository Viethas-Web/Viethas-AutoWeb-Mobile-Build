import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeBlankComponent } from './home-blank.component';

describe('HomeBlankComponent', () => {
  let component: HomeBlankComponent;
  let fixture: ComponentFixture<HomeBlankComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeBlankComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeBlankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
