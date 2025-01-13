import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsNumber, Min, Max, IsArray } from 'class-validator';

export class CreateAssignmentDto {
  @ApiProperty({
    example: 'Project Milestone 1',
    description: 'Title of the assignment'
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example: 'Submit your initial project design documents',
    description: 'Detailed description of the assignment'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '2024-02-01T23:59:59Z',
    description: 'Due date for the assignment'
  })
  @IsDateString()
  dueDate: Date;

 
}