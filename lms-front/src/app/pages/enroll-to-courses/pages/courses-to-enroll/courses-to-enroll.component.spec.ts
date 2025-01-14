import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursesToEnrollComponent } from './courses-to-enroll.component';

describe('CoursesToEnrollComponent', () => {
  let component: CoursesToEnrollComponent;
  let fixture: ComponentFixture<CoursesToEnrollComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoursesToEnrollComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoursesToEnrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
