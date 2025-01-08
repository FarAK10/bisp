import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsEnum, IsString } from 'class-validator';
import { EventType } from '../enitites/event.entity';

export class BaseScheduleDto {
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

export class GetScheduleDto extends BaseScheduleDto {
  @ApiProperty()
  id: number;
}
