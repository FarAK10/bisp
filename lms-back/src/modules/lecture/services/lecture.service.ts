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
import { CreateLectureDto } from '../dto/create-lecture.dto';
import { UpdateLectureDto } from '../dto/update-lecture.dto';
import { CourseService } from '@modules/course/services/course.service';
import { ScheduleService } from '@modules/schedule/services/schedule.service';

@Injectable()
export class LectureService {
  constructor(
    @InjectRepository(Lecture)
    private lecturesRepository: Repository<Lecture>,
    private courseService: CourseService,
    private scheduleService: ScheduleService,
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

    // Check for schedule conflicts before creating lecture
    for (const scheduleDto of createLectureDto.schedules) {
      const hasConflict = await this.scheduleService.checkScheduleConflicts(
        scheduleDto.startTime,
        scheduleDto.endTime,
        scheduleDto.dayOfWeek,
        scheduleDto.roomNumber,
      );
      if (hasConflict) {
        throw new ConflictException(
          `Schedule conflict detected for room ${scheduleDto.roomNumber} at the specified time`,
        );
      }
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
    savedLecture.schedules = createdSchedules;
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
      relations: ['course', 'course.professor', 'schedules'],
    });

    if (!lecture) {
      throw new NotFoundException('Lecture not found.');
    }

    if (updateLectureDto.schedules) {
      // Delete existing schedules
      if (lecture.schedules) {
        await this.scheduleService.deleteSchedules(lecture.schedules);
      }

      // Check for conflicts with new schedules
      for (const scheduleDto of updateLectureDto.schedules) {
        const hasConflict = await this.scheduleService.checkScheduleConflicts(
          scheduleDto.startTime,
          scheduleDto.endTime,
          scheduleDto.dayOfWeek,
          scheduleDto.roomNumber,
        );
        if (hasConflict) {
          throw new ConflictException(
            `Schedule conflict detected for room ${scheduleDto.roomNumber} at the specified time`,
          );
        }
      }

      // Create new schedules
      const { schedules, ...lectureData } = updateLectureDto;
      Object.assign(lecture, lectureData);
      const savedLecture = await this.lecturesRepository.save(lecture);

      const createdSchedules = await Promise.all(
        schedules.map((scheduleDto) =>
          this.scheduleService.update(scheduleDto.id, scheduleDto),
        ),
      );

      savedLecture.schedules = createdSchedules;
      return savedLecture;
    }
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
