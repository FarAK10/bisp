// dto/create-schedule.dto.ts
import { IsDate, IsEnum, IsNumber, IsString } from 'class-validator';
import { EventType } from '../enitites/event.entity';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { BaseScheduleDto, GetScheduleDto } from './get-scedule.dto';

export class CreateScheduleDto extends BaseScheduleDto {
  @ApiProperty()
  @IsNumber()
  lectureId: number;
}
