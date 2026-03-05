import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SslConfigComponent } from './ssl-config.component';

describe('SslConfigComponent', () => {
  let component: SslConfigComponent;
  let fixture: ComponentFixture<SslConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SslConfigComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SslConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
