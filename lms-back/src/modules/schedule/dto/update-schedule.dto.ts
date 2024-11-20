import { PartialType } from '@nestjs/swagger';
import { CreateScheduleDto } from './create-schedule.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateScheduleDto extends PartialType(CreateScheduleDto) {
  @ApiProperty({ description: 'Unique identifier for the schedule' })
  @IsNotEmpty()
  @IsNumber()
  id: number;
}
