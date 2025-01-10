import { EnrollmentStatus } from "@common/constants/enrollment-status.enum";
import { GetScheduleDto } from "@modules/schedule/dto/get-scedule.dto";
import { GetUserDto } from "@modules/user/dto/get-user.dto";
import { ApiProperty, PartialType ,} from "@nestjs/swagger";
import { GetCourseDto } from "./get-course.dto";

export class GetEnrolledCourseDto  extends GetCourseDto{
  

    @ApiProperty({ enum: EnrollmentStatus, required: false })
    enrollmentStatus?: EnrollmentStatus;
  
    @ApiProperty({ required: false })
    finalGrade?: number;
  
    @ApiProperty()
    createdAt: Date;
  
    @ApiProperty()
    updatedAt: Date;
  }