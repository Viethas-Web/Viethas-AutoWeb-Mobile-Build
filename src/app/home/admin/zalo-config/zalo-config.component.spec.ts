import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZaloConfigComponent } from './zalo-config.component';

describe('ZaloConfigComponent', () => {
  let component: ZaloConfigComponent;
  let fixture: ComponentFixture<ZaloConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ZaloConfigComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ZaloConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
