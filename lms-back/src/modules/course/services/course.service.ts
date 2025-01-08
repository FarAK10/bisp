import { Role } from '@common/constants/roles.enum';
import { User } from '@modules/user/entities/user.entity';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { Course } from '../entities/course.entity';
import { UserService } from '@modules/user/services/user.service';
import { Roles } from '@common/decorators/role.decorator';
import { StudentEnrollment } from '../entities/student-entrollment.entity';
import { CourseTableResponseDto } from '../dto/table-response.dto';
import { ScheduleService } from '@modules/schedule/services/schedule.service';
import { BaseScheduleDto } from '@modules/schedule/dto/get-scedule.dto';
import { WeekEnum } from '@common/constants/week.enum';
import * as moment from 'moment';
@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private userService: UserService,
    @InjectRepository(StudentEnrollment)
    private studentEnrollmentRepository: Repository<StudentEnrollment>,
    private scheduleService: ScheduleService,
  ) {}

  async create(
    createCourseDto: CreateCourseDto,
    professorId: number,
  ): Promise<Course> {
    const professor = await this.userService.findOne(
      createCourseDto.professorId,
    );

    const conflicts = await this.scheduleService.checkBatchScheduleConflicts(
      createCourseDto.schedules,
    );

    if (conflicts.length > 0) {
      throw new ConflictException(
        `Schedule conflicts detected: ${conflicts
          .map(
            (conflict) =>
              `Room ${conflict.roomNumber} on ${conflict.dayOfWeek} from ${conflict.startTime} to ${conflict.endTime}`,
          )
          .join('; ')}`,
      );
    }
    const newSchedulePromises = createCourseDto.schedules.map((scheduleDto) =>
      this.scheduleService.create(scheduleDto),
    );
    const newSchedulesResult = await Promise.all(newSchedulePromises);

    const course = this.courseRepository.create({
      ...createCourseDto,
      professor,
      schedules: newSchedulesResult,
    });

    return this.courseRepository.save(course);
  }

  async findAll(
    page?: number,
    limit?: number,
  ): Promise<CourseTableResponseDto> {
    if (!page || !limit) {
      const [data, count] = await this.courseRepository.findAndCount({
        relations: ['professor', 'schedules'],
      });

      return {
        data,
        count,
        page: null,
        limit: null,
      };
    }
    const [data, count] = await this.courseRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['professor'],
    });
    return {
      data,
      count,
      page,
      limit,
    };
  }

  async findOne(
    id: number,
    relations: string[] = ['professor', 'schedules'],
  ): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: relations,
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found.`);
    }
    return course;
  }

  async update(
    courseId: number,
    updateCourseDto: UpdateCourseDto,
  ): Promise<Course> {
    const { professorId, ...rest } = updateCourseDto;

    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['professor'],
    });

    if (!course) {
      throw new BadRequestException('Course not found');
    }

    if (professorId) {
      const professor = await this.userService.findOne(professorId);

      if (!professor) {
        throw new BadRequestException('Professor not found');
      }

      course.professor = professor;
    }

    // Combine new and updated schedules
    const { newSchedules, updatedSchedules, ...lectureData } = updateCourseDto;
    const allSchedules = [...newSchedules, ...updatedSchedules];

    if (allSchedules.length > 0) {
      // Batch conflict check
      const conflicts = await this.scheduleService.checkBatchScheduleConflicts(
        allSchedules as any,
      );
      if (conflicts.length > 0) {
        const formatDateTime = (date: Date): string =>
          moment(date).format('HH:mm');

        throw new ConflictException(
          `Schedule conflicts detected: ${conflicts
            .map(
              (conflict) =>
                `Room ${conflict.roomNumber} on ${WeekEnum[conflict.dayOfWeek]} from ${formatDateTime(conflict.startTime)} to ${formatDateTime(conflict.endTime)}`,
            )
            .join('; ')}`,
        );
      }

      // Delete existing schedules only when there are changes
      if (course.schedules && course.schedules.length > 0) {
        await this.scheduleService.deleteSchedules(course.schedules);
      }

      // Batch create and update schedules
      const updatedSchedulePromises = updatedSchedules.map((scheduleDto) =>
        this.scheduleService.update(scheduleDto.id, scheduleDto),
      );
      const newSchedulePromises = newSchedules.map((scheduleDto) =>
        this.scheduleService.create(scheduleDto),
      );

      const updatedSchedulesResult = await Promise.all(updatedSchedulePromises);
      const newSchedulesResult = await Promise.all(newSchedulePromises);

      course.schedules = [...updatedSchedulesResult, ...newSchedulesResult];
    }

    // Update lecture details
    Object.assign(course, lectureData);

    Object.assign(course, rest);

    return this.courseRepository.save(course);
  }
  async remove(id: number, user: User): Promise<void> {
    const course = await this.findOne(id);

    await this.courseRepository.delete(id);
  }

  async enrollStudent(courseId: number, studentId: number) {
    const course = await this.courseRepository.findOne({
      where: {
        id: courseId,
      },
    });
    const student = await this.userService.findOne(studentId);

    const enrollment = this.studentEnrollmentRepository.create({
      course,
      student,
      enrollmentDate: new Date(),
      status: 'active',
    });

    return this.studentEnrollmentRepository.save(enrollment);
  }

  // Update final grade
  async setFinalGrade(enrollmentId: number, grade: number) {
    const enrollment = await this.studentEnrollmentRepository.findOne({
      where: { enrollmentId: enrollmentId },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    enrollment.finalGrade = grade;
    enrollment.status = 'completed';

    return this.studentEnrollmentRepository.save(enrollment);
  }

  async unenrollStudentFromCourse(courseId: number, studentId: number) {
    const enrollment = await this.studentEnrollmentRepository.findOne({
      where: { course: { id: courseId }, student: { id: studentId } },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found.');
    }

    await this.studentEnrollmentRepository.remove(enrollment);
  }

  private async checkScheduleConflicts(schedules: BaseScheduleDto[]) {
    const conflicts = await Promise.all(
      schedules.map((schedule) =>
        this.scheduleService.checkScheduleConflicts(
          schedule.startTime,
          schedule.endTime,
          schedule.dayOfWeek,
          schedule.roomNumber,
        ),
      ),
    );

    return conflicts.filter((conflict) => conflict);
  }
}
