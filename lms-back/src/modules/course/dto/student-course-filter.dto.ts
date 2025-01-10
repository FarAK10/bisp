import { EnrollmentStatus } from "@common/constants/enrollment-status.enum";
import { ApiProperty, } from "@nestjs/swagger";
import {IsEnum,IsString,IsOptional,IsDate,} from 'class-validator';
import { Type } from 'class-transformer';

export class StudentCoursesFilterDto {
    @ApiProperty({ required: false, enum: EnrollmentStatus })
    @IsEnum(EnrollmentStatus)
    @IsOptional()
    status?: EnrollmentStatus;
  
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    search?: string;
  
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
  