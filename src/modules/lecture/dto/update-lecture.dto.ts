// lectures/dto/update-lecture.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateLectureDto } from './create-lecture.dto';
import { ApiTags, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateLectureDto extends PartialType(CreateLectureDto) {
  @ApiProperty()
  @IsNotEmpty()
  id: number;
}
