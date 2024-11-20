// assignments/dto/create-assignment.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateAssignmentDto {
  @ApiProperty()
  @IsString()
  title: string;
  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;
  @ApiProperty()
  @IsDateString()
  dueDate: string;
}
