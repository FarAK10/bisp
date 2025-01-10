// lectures/dto/update-lecture.dto.ts
import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateLectureDto } from './create-lecture.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { UpdateScheduleDto } from '@modules/schedule/dto/update-schedule.dto';
import { Type } from 'class-transformer';
import { CreateScheduleDto } from '@modules/schedule/dto/create-schedule.dto';

export class UpdateLectureDto extends CreateLectureDto {
  @ApiProperty()
  @IsNotEmpty()
  id: number;
}
