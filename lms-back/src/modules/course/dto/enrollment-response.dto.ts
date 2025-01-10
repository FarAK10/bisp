import { EnrollmentStatus } from "@common/constants/enrollment-status.enum";
import { ApiProperty } from "@nestjs/swagger";

export class EnrollmentResponseDto {
    @ApiProperty()
    studentId: number;
  
    @ApiProperty()
    studentName: string;
  
    @ApiProperty({ enum: EnrollmentStatus })
    status: EnrollmentStatus;
  
    @ApiProperty({ nullable: true })
    finalGrade: number;
  
    @ApiProperty()
    enrollmentDate: Date;
  }
  