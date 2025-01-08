import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UpdateScheduleDto } from '@modules/schedule/dto/update-schedule.dto';
import { CreateScheduleDto } from '@modules/schedule/dto/create-schedule.dto';
import { Type } from 'class-transformer';
export class CreateCourseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: [CreateScheduleDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateScheduleDto)
  schedules: CreateScheduleDto[];

  @ApiProperty()
  @IsNumber()
  professorId: number;
}
