import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateCourseDto } from './create-course.dto';
import { ApiProperty } from '@nestjs/swagger';
import { CreateScheduleDto } from '@modules/schedule/dto/create-schedule.dto';
import { UpdateScheduleDto } from '@modules/schedule/dto/update-schedule.dto';
import { Type } from 'class-transformer';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
  @ApiProperty()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ type: [UpdateScheduleDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateScheduleDto)
  updatedSchedules: UpdateScheduleDto[];

  @ApiProperty({ type: [UpdateScheduleDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateScheduleDto)
  newSchedules: CreateScheduleDto[];
}
