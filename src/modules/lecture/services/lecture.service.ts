// lectures/lectures.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lecture } from '../entities/lecture.entity';
import { Repository } from 'typeorm';
import { Course } from '@modules/course/entities/course.entity';
import { CreateLectureDto } from '../dto/create-lecture.dto';
import { UpdateLectureDto } from '../dto/update-lecture.dto';
import { CourseService } from '@modules/course/services/course.service';

@Injectable()
export class LectureService {
  constructor(
    @InjectRepository(Lecture)
    private lecturesRepository: Repository<Lecture>,
    private courseService: CourseService,
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
    if (course.professor.id !== professorId) {
      throw new ForbiddenException(
        'You are not authorized to add lectures to this course.',
      );
    }

    const lecture = this.lecturesRepository.create({
      ...createLectureDto,
      course,
    });
    return await this.lecturesRepository.save(lecture);
  }

  // Get lectures for a course
  async getLecturesByCourse(
    userId: number,
    courseId: number,
  ): Promise<Lecture[]> {
    const course = await this.courseService.findOne(courseId);

    const isStudent = course.students.some((student) => student.id === userId);
    const isProfessor = course.professor.id === userId;

    if (!isStudent && !isProfessor) {
      throw new ForbiddenException('Access denied to this course.');
    }

    return await this.lecturesRepository.find({
      where: { course },
      relations: ['lectureMaterials'],
      order: { createdAt: 'ASC' },
    });
  }

  // Get a single lecture
  async getLectureById(userId: number, lectureId: number): Promise<Lecture> {
    const lecture = await this.lecturesRepository.findOne({
      where: { id: lectureId },
      relations: ['course', 'course.students', 'course.professor'],
    });
    if (!lecture) {
      throw new NotFoundException('Lecture not found.');
    }

    const course = lecture.course;
    const isStudent = course.students.some((student) => student.id === userId);
    const isProfessor = course.professor.id === userId;

    if (!isStudent && !isProfessor) {
      throw new ForbiddenException('Access denied to this lecture.');
    }

    return lecture;
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

    if (lecture.course.professor.id !== professorId) {
      throw new ForbiddenException(
        'You are not authorized to update this lecture.',
      );
    }

    Object.assign(lecture, updateLectureDto);
    return await this.lecturesRepository.save(lecture);
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
