import { GetUserDto } from "@modules/user/dto/get-user.dto";
import { GetCourseDto } from "./get-course.dto";
import { ApiProperty } from "@nestjs/swagger";
import {
    IsArray,
    IsDate,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
  } from 'class-validator';
  import {Type} from 'class-transformer'
import { LectureDto } from "@modules/lecture/dto/lecture/get-lecture.dto";
import { EnrollmentResponseDto } from "./enrollment-response.dto";
export class CourseWithLecturesResponseDto extends GetCourseDto {
   
  
    @ApiProperty({ type: GetUserDto })
    @ValidateNested()
    @Type(() => GetUserDto)
    professor: GetUserDto;
  
  
  
    @ApiProperty({ type: [LectureDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LectureDto)
    lectures: LectureDto[];
  
    @ApiProperty({ type: [EnrollmentResponseDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EnrollmentResponseDto)
    enrollments: EnrollmentResponseDto[];
  
    @ApiProperty()
    @IsDate()
    @Type(() => Date)
    createdAt: Date;
  
    @ApiProperty()
    @IsDate()
    @Type(() => Date)
    updatedAt: Date;
  }
  