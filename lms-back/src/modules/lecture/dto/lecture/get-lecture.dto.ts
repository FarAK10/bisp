import { GetCourseDto } from '@modules/course/dto/get-course.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsString,
  IsNumber,
} from 'class-validator';

export class BaseLectureDTto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsNumber()
  courseId: number;
}
export class GetLectureDto extends BaseLectureDTto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsNumber()
  courseId: number;

  @ApiProperty({ type: GetCourseDto })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GetCourseDto)
  course: GetCourseDto
}
