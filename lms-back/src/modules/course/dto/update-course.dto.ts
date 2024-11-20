import { IsNotEmpty } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseDto } from './create-course.dto';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateCourseDto extends PartialType(CreateCourseDto) {
  @ApiProperty()
  @IsNotEmpty()
  id: number;
}
