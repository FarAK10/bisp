import { Injectable } from "@nestjs/common";
import { Course } from "../entities/course.entity";
import { GetCourseDto } from "../dto/get-course.dto";

@Injectable()
export class CourseProfile {
     
    mapCourseToGetCourseDto(course:Course) :GetCourseDto{

        return {
            id:course.id,
            professor: course.professor,
            schedules: course.schedules,
            title: course.title,
            description: course.description
        }

    }

}