import { EnrollmentStatus } from "@common/constants/enrollment-status.enum";
import { ApiProperty, } from "@nestjs/swagger";
import {IsEnum,IsString,IsOptional,IsDate,IsBoolean} from 'class-validator';
import { Type } from 'class-transformer';
export class ProfessorCoursesFilterDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    search?: string;
  
    @ApiProperty({ required: false })
    @IsBoolean()
    @IsOptional()
    hasEnrollments?: boolean;
  
    @ApiProperty({ required: false })
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    startDate?: Date;
  
    @ApiProperty({ required: false })
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    endDate?: Date;
  }