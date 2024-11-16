// lectures/dto/create-lecture.dto.ts
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLectureDto {
  @ApiProperty()
  @IsString()
  title: string;
  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;
}
