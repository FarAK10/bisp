import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LectureModalComponent } from './lecture-modal.component';

describe('LectureModalComponent', () => {
  let component: LectureModalComponent;
  let fixture: ComponentFixture<LectureModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LectureModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LectureModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
