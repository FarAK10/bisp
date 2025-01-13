import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class GradeSubmissionDto {
  @ApiProperty({
    example: 95,
    description: 'Grade to assign to the submission (0-100)',
    minimum: 0,
    maximum: 100
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  grade: number;

  @ApiProperty({
    example: 'Excellent work!',
    description: 'Feedback for the student',
    required: false
  })
  @IsOptional()
  @IsString()
  feedback?: string;
}