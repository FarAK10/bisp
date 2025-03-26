import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { GPTFeedbackDto } from '../../../../../../core/api/lms-api';
import { NzCardModule } from 'ng-zorro-antd/card';

@Component({
  selector: 'app-gpt-feedback',
  standalone: true,
  imports: [CommonModule,NzCardModule],
  templateUrl: './gpt-feedback.component.html',
  styleUrl: './gpt-feedback.component.less'
})
export class GptFeedbackComponent {
  gptFeedback = input<GPTFeedbackDto>();

}
