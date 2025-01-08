import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GetBaseUserDto, GetUserDto } from '@modules/user/dto/get-user.dto';
import { CreateScheduleDto } from '@modules/schedule/dto/create-schedule.dto';
import { Type } from 'class-transformer';
import { GetScheduleDto } from '@modules/schedule/dto/get-scedule.dto';
export class GetCourseDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  title: string;
  @ApiProperty()
  description?: string;

  @ApiProperty()
  professor: GetBaseUserDto;

  @ApiProperty({ type: [GetScheduleDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GetScheduleDto)
  schedules: GetScheduleDto[];
}
