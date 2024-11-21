import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateAttendanceRecordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  student_id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  course_id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  attendance_status: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  tracking_method: string;
}
