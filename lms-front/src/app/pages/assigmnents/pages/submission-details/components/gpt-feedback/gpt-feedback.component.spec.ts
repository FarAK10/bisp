import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GptFeedbackComponent } from './gpt-feedback.component';

describe('GptFeedbackComponent', () => {
  let component: GptFeedbackComponent;
  let fixture: ComponentFixture<GptFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GptFeedbackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GptFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
