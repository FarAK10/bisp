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

@Injectable()
export class LectureService {
  constructor(
    @InjectRepository(Lecture)
    private lecturesRepository: Repository<Lecture>,
    private courseService: CourseService,
    private scheduleService: ScheduleService,
    @InjectRepository(StudentEnrollment)
    private studentEnrollmentRepository: Repository<StudentEnrollment>,
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
    const { schedules, ...lectureData } = createLectureDto;
    const lecture = this.lecturesRepository.create({
      ...lectureData,
      course,
    });
    const savedLecture = await this.lecturesRepository.save(lecture);

    // Create schedules for the lecture
    const createdSchedules = await Promise.all(
      schedules.map((scheduleDto) => this.scheduleService.create(scheduleDto)),
    );

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
    userId: number,
    courseId: number,
  ): Promise<Lecture[]> {
    // 2) Fetch the course (with 'professor' if you need to check professor)
    const course = await this.courseService.findOne(courseId, ['professor']);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // 3) Check if user is the professor
    const isProfessor = course.professor.id === userId;

    // 4) Check if user is enrolled (student) via the StudentEnrollment table
    const enrollment = await this.studentEnrollmentRepository.findOne({
      where: {
        student: { id: userId },
        course: { id: courseId },
      },
    });
    const isStudent = !!enrollment; // true if an enrollment row exists

    if (!isStudent && !isProfessor) {
      throw new ForbiddenException('Access denied to this course.');
    }

    // 5) Return the lectures
    return await this.lecturesRepository.find({
      where: { course },
      relations: ['lectureMaterials'],
      order: { createdAt: 'ASC' },
    });
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
      relations: ['course', 'course.professor'],
    });
    if (!lecture) {
      throw new NotFoundException('Lecture not found.');
    }

    if (lecture.course.professor.id !== professorId) {
      throw new ForbiddenException(
        'You are not authorized to delete this lecture.',
      );
    }

    await this.lecturesRepository.remove(lecture);
  }
}
