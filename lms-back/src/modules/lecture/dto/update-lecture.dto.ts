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

export class UpdateLectureDto extends PartialType(
  OmitType(CreateLectureDto, ['schedules'] as const),
) {
  @ApiProperty()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ type: [UpdateScheduleDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateScheduleDto)
  schedules: UpdateScheduleDto[];
}
