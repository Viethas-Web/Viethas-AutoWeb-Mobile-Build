import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoCandidatesComponent } from './info-candidates.component';

describe('InfoCandidatesComponent', () => {
  let component: InfoCandidatesComponent;
  let fixture: ComponentFixture<InfoCandidatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoCandidatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoCandidatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
