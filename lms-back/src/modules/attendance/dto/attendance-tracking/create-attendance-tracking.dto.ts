// src/attendance/dto/create-attendance-tracking.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsDate } from 'class-validator';

export class CreateAttendanceTrackingDto {
  @ApiProperty()
  @IsNotEmpty()
  student_id: number;
  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  entry_time: Date;
  @ApiProperty()
  @IsOptional()
  @IsDate()
  exit_time?: Date;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  tracking_method: string;
  @ApiProperty()
  @IsOptional()
  @IsString()
  device_identifier?: string;
}
