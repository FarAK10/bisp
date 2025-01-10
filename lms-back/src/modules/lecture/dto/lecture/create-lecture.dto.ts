// lectures/dto/create-lecture.dto.ts
import { IsString, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateScheduleDto } from '@modules/schedule/dto/create-schedule.dto';
import { Type } from 'class-transformer';

export class CreateLectureDto {
  @ApiProperty()
  @IsString()
  title: string;
  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;
}
