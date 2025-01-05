import { TableResponseDto } from '@common/dto/table.dto';
import { ApiProperty } from '@nestjs/swagger';
import { GetCourseDto } from './get-course.dto';

export class CourseTableResponseDto extends TableResponseDto<GetCourseDto> {
  @ApiProperty({ type: GetCourseDto, isArray: true })
  data: GetCourseDto[];
}
