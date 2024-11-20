// dto/create-schedule.dto.ts
import { IsDate, IsEnum, IsNumber, IsString } from 'class-validator';
import { EventType } from '../enitites/event.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateScheduleDto {
  @ApiProperty()
  @IsNumber()
  lectureId: number;

  @ApiProperty()
  @IsDate()
  startTime: Date;

  @ApiProperty()
  @IsDate()
  endTime: Date;

  @ApiProperty()
  @IsNumber()
  dayOfWeek: number;

  @ApiProperty()
  @IsEnum(EventType)
  type: EventType;

  @ApiProperty()
  @IsString()
  roomNumber: string;
}
