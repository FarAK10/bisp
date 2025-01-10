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
  IsDate,
} from 'class-validator';
import { GetLectureMaterialDto } from '../lecture-material/get-lecture-material.dto';

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

export class LectureDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;

  @ApiProperty({ type: [GetLectureMaterialDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GetLectureMaterialDto)
  materials: GetLectureMaterialDto[];
}