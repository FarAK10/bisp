// lectures/lectures.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lecture } from '../entities/lecture.entity';
import { Repository } from 'typeorm';
import { Course } from '@modules/course/entities/course.entity';
import { CreateLectureDto } from '../dto/lecture/create-lecture.dto';
import { UpdateLectureDto } from '../dto/lecture/update-lecture.dto';
import { CourseService } from '@modules/course/services/course.service';
import { ScheduleService } from '@modules/schedule/services/schedule.service';
import { StudentEnrollment } from '@modules/course/entities/student-entrollment.entity';
import { LectureMaterial } from '../entities';

@Injectable()
export class LectureService {
  constructor(
    @InjectRepository(Lecture)
    private lecturesRepository: Repository<Lecture>,
    private courseService: CourseService,
    private scheduleService: ScheduleService,
    @InjectRepository(StudentEnrollment)
    private studentEnrollmentRepository: Repository<StudentEnrollment>,
    @InjectRepository(LectureMaterial)
    private  lectureMaterialRepository:Repository<LectureMaterial>,
  ) {}

  // Create a lecture within a course
  async createLecture(
    professorId: number,
    courseId: number,
    createLectureDto: CreateLectureDto,
  ): Promise<Lecture> {
    const course = await this.courseService.findOne(courseId);
    if (!course) {
      throw new NotFoundException('Course not found.');
    }

    // Create lecture with course reference
    
    const lecture = this.lecturesRepository.create({
      ...createLectureDto,
      course,
    });
    const savedLecture = await this.lecturesRepository.save(lecture);

   

    // Update lecture with schedules
    return savedLecture;
  }

  // Update a lecture

  async updateLecture(
    professorId: number,
    lectureId: number,
    updateLectureDto: UpdateLectureDto,
  ): Promise<Lecture> {
    const lecture = await this.lecturesRepository.findOne({
      where: { id: lectureId },
      relations: ['course', 'course.professor'],
    });

    if (!lecture) {
      throw new NotFoundException('Lecture not found.');
    }

    // Combine new and updated schedules
    const { ...lectureData } = updateLectureDto;

    // Update lecture details
    Object.assign(lecture, lectureData);
    return this.lecturesRepository.save(lecture);
  }

  // Get lectures for a course
  async getLecturesByCourse(
    courseId: number,
  ): Promise<Lecture[]> {
    const course = await this.courseService.findOne(courseId, ['professor']);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return await this.lecturesRepository.find({
      where: { course:{id: course.id}},
      relations: ['lectureMaterials'],
      order: { createdAt: 'ASC' },
    })
  }

  async getLectureById(userId: number, lectureId: number): Promise<Lecture> {
    const lecture = await this.lecturesRepository.findOne({
      where: { id: lectureId },
      relations: ['course', 'course.professor'],
    });
    if (!lecture) {
      throw new NotFoundException('Lecture not found.');
    }

    const course = lecture.course;
    const isProfessor = course.professor.id === userId;

    const enrollment = await this.studentEnrollmentRepository.findOne({
      where: {
        student: { id: userId },
        course: { id: course.id },
      },
    });
    const isStudent = !!enrollment;

    if (!isStudent && !isProfessor) {
      throw new ForbiddenException('Access denied to this lecture.');
    }

    return lecture;
  }
  // Delete a lecture
  async deleteLecture(professorId: number, lectureId: number): Promise<void> {
    const lecture = await this.lecturesRepository.findOne({
      where: { id: lectureId },
      relations: ['course', 'course.professor','lectureMaterials'],
    });
    if (!lecture) {
      throw new NotFoundException('Lecture not found.');
    }

    if (lecture.course.professor.id !== professorId) {
      throw new ForbiddenException(
        'You are not authorized to delete this lecture.',
      );
    }
    if (lecture.lectureMaterials?.length) {
      await this.lectureMaterialRepository.remove(lecture.lectureMaterials);
    }
  
    await this.lecturesRepository.remove(lecture);
  }
}
