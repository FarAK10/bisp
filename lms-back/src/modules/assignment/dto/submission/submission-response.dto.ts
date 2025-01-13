import { GetUserDto } from '@modules/user/dto/get-user.dto';
import { User } from '@modules/user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class SubmissionFileResponseDto {
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the submission file'
  })
  id: number;

  @ApiProperty({
    example: 'assignment1-solution.pdf',
    description: 'Original name of the uploaded file'
  })
  originalFileName: string;

  @ApiProperty({
    example: '2024-01-11T10:30:00Z',
    description: 'Timestamp when the file was uploaded'
  })
  uploadedAt: Date;
}

export class SubmissionResponseDto {
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the submission'
  })
  id: number;

  @ApiProperty({
    type: [SubmissionFileResponseDto],
    description: 'Array of files included in this submission'
  })
  files: SubmissionFileResponseDto[];

  @ApiProperty({type:GetUserDto})
  submittedStudent:GetUserDto;

  @ApiProperty({
    example: 95,
    description: 'Grade assigned to the submission',
    required: false,
    nullable: true
  })
  grade?: number;

  @ApiProperty({
    example: 'Excellent work!',
    description: 'Feedback from the professor',
    required: false,
    nullable: true
  })
  feedback?: string;

  @ApiProperty({
    example: '2024-01-11T10:30:00Z',
    description: 'Timestamp when the submission was created'
  })
  submittedAt: Date;

  @ApiProperty({
    example: '2024-01-11T10:30:00Z',
    description: 'Timestamp when the submission was last updated'
  })
  updatedAt: Date;
}