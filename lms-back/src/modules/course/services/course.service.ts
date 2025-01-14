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
import { EnrollmentStatus } from '@common/constants/enrollment-status.enum';
import { GetCourseDto } from '../dto/get-course.dto';
import { GetEnrolledCourseDto } from '../dto/get-enrolled-course.dto';
import { CourseWithLecturesResponseDto } from '../dto/course-with-lectures.dto';
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
      relations: ['professor','schedules'],
    });
    return {
      data,
      count,
      page,
      limit,
    };
  }

  async getCoursesToEnroll(studentId: number): Promise<Course[]> {
    return this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.professor', 'professor')
      .leftJoinAndSelect('course.schedules', 'schedules')
      .leftJoin('course.enrollments', 'enrollment')
      .leftJoin('enrollment.student', 'student')
      .where(qb => {
        const subQuery = qb
          .subQuery()
          .select('enrollment.courseId')
          .from(StudentEnrollment, 'enrollment')
          .where('enrollment.student = :studentId')
          .andWhere('enrollment.status IN (:...statuses)')
          .getQuery();
        return 'course.id NOT IN ' + subQuery;
      })
      .setParameter('studentId', studentId)
      .setParameter('statuses', [
        EnrollmentStatus.ENROLLED,
        EnrollmentStatus.WAITLISTED,
        EnrollmentStatus.COMPLETED
      ])
      .getMany();
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

  async getStudentsCourses(
    studentId: number,
    filters?: {
      status?: EnrollmentStatus;
      search?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<GetCourseDto[]> {
    const query = this.studentEnrollmentRepository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.course', 'course')
      .leftJoinAndSelect('course.professor', 'professor')
      .leftJoinAndSelect('course.schedules', 'schedules')
      .leftJoinAndSelect('course.assignments', 'assignments')
      .leftJoinAndSelect('course.lectures', 'lectures')
      .where('enrollment.student = :studentId', { studentId });
  
    // Apply filters
    if (filters) {
      if (filters.status) {
        query.andWhere('enrollment.status = :status', { status: filters.status });
      }
      if (filters.search) {
        query.andWhere(
          '(course.title ILIKE :search OR course.description ILIKE :search)',
          { search: `%${filters.search}%` }
        );
      }
      if (filters.startDate) {
        query.andWhere('course.createdAt >= :startDate', { startDate: filters.startDate });
      }
      if (filters.endDate) {
        query.andWhere('course.createdAt <= :endDate', { endDate: filters.endDate });
      }
    }
  
    const enrollments = await query.getMany();
  
    return enrollments.map(enrollment => ({
      id: enrollment.course.id,
      title: enrollment.course.title,
      description: enrollment.course.description,
      professor: {
        id: enrollment.course.professor.id,
        firstName: enrollment.course.professor.firstName,
        lastName:enrollment.course.professor.lastName,
        email: enrollment.course.professor.email
      },
      schedules: enrollment.course.schedules,
      enrollmentStatus: enrollment.status,
      finalGrade: enrollment.finalGrade,
      enrollmentDate: enrollment.enrollmentDate
    }));
  }

  async getProffessorCourses(
    profId: number,
    filters?: {
      search?: string;
      hasEnrollments?: boolean;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<GetEnrolledCourseDto[]> {
    const query = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.professor', 'professor')
      .leftJoinAndSelect('course.schedules', 'schedules')
      .leftJoinAndSelect('course.enrollments', 'enrollments')
      .leftJoinAndSelect('course.lectures', 'lectures')
      .leftJoinAndSelect('enrollments.student', 'student')
      .where('course.professor = :profId', { profId });
  
    // Apply filters
    if (filters) {
      if (filters.search) {
        query.andWhere(
          '(course.title ILIKE :search OR course.description ILIKE :search)',
          { search: `%${filters.search}%` }
        );
      }
      if (filters.hasEnrollments) {
        query.andWhere('enrollments.enrollmentId IS NOT NULL');
      }
      if (filters.startDate) {
        query.andWhere('course.createdAt >= :startDate', { startDate: filters.startDate });
      }
      if (filters.endDate) {
        query.andWhere('course.createdAt <= :endDate', { endDate: filters.endDate });
      }
    }
  
    const courses = await query.getMany();
  
    return courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      professor: {
        id: course.professor.id,
        firstName: course.professor.firstName,
        lastName: course.professor.lastName,


        email: course.professor.email
      },
      schedules: course.schedules,

      lectures: course.lectures,
      enrollments: course.enrollments.map(enrollment => ({
        studentId: enrollment.student.id,
        studentName: enrollment.student.firstName,
        status: enrollment.status,
        finalGrade: enrollment.finalGrade,
        enrollmentDate: enrollment.enrollmentDate
      })),
 
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    }));
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
    if (!course) {
      throw new NotFoundException(`Course with id ${courseId} does not exist.`);
    }
  
    const student = await this.userService.findOne(studentId);
    if (!student) {
      throw new NotFoundException(`Student with id ${studentId} does not exist.`);
    }
  
    const existingEnrollment = await this.studentEnrollmentRepository
      .createQueryBuilder('enrollment')
      .where('enrollment.courseId = :courseId', { courseId })
      .andWhere('enrollment.student = :studentId', { studentId })
      .getOne();
  
    if (existingEnrollment && 
        [EnrollmentStatus.ENROLLED, EnrollmentStatus.WAITLISTED].includes(existingEnrollment.status)) {
      throw new ConflictException(
        `Student with id ${studentId} is already enrolled or waitlisted for course with id ${courseId}.`
      );
    }
  
    if (existingEnrollment && existingEnrollment.status === EnrollmentStatus.DROPPED) {
      existingEnrollment.status = EnrollmentStatus.ENROLLED;
      existingEnrollment.enrollmentDate = new Date(); 
      existingEnrollment.finalGrade = null; 
      return this.studentEnrollmentRepository.save(existingEnrollment);
    }
  
    const enrollment = this.studentEnrollmentRepository.create({
      course,
      student,
      enrollmentDate: new Date(),
      status: EnrollmentStatus.ENROLLED,
    });
  
    return this.studentEnrollmentRepository.save(enrollment);
  }

  async getCourseWithLecturesById(courseId: number): Promise<CourseWithLecturesResponseDto> {
    const course = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.professor', 'professor')
      .leftJoinAndSelect('course.schedules', 'schedules')
      .leftJoinAndSelect('course.lectures', 'lectures')
      .leftJoinAndSelect('lectures.lectureMaterials', 'materials')
      .leftJoinAndSelect('materials.uploadedBy', 'uploadedBy')
      .leftJoinAndSelect('course.enrollments', 'enrollments')
      .leftJoinAndSelect('enrollments.student', 'student')
      .where('course.id = :courseId', { courseId })
      .orderBy({
        'lectures.createdAt': 'DESC',
        'materials.uploadedAt': 'DESC',
      })
      .getOne();
  
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
  
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      professor:course.professor,
      schedules: course.schedules,
      lectures: course.lectures.map(lecture => ({
        id: lecture.id,
        title: lecture.title,
        description: lecture.description,
        createdAt: lecture.createdAt,
        updatedAt: lecture.updatedAt,
        materials: lecture.lectureMaterials.map(material => ({
          id: material.id,
          title: material.title,
          originalName: material.originalName,
          filename: material.filename,
          filePath: material.filePath,
          mimetype: material.mimetype,
          uploadedAt: material.uploadedAt,
          uploadedBy: {
            id: material.uploadedBy.id,
            firstName: material.uploadedBy.firstName,
            lastName: material.uploadedBy.lastName,
            email: material.uploadedBy.email,
          },
        })),
      })),
      enrollments: course.enrollments.map(enrollment => ({
        studentId: enrollment.student.id,
        studentName: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
        status: enrollment.status,
        finalGrade: enrollment.finalGrade,
        enrollmentDate: enrollment.enrollmentDate,

      })),
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };
  }

  // Update final grade
  async setFinalGrade(enrollmentId: number, grade: number) {
    const enrollment = await this.studentEnrollmentRepository.findOne({
      where: { enrollmentId: enrollmentId },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    enrollment.finalGrade = grade;
    enrollment.status = EnrollmentStatus.COMPLETED;

    return this.studentEnrollmentRepository.save(enrollment);
  }

  async unenrollStudentFromCourse(courseId: number, studentId: number) {
    const enrollment = await this.studentEnrollmentRepository.findOne({
      where: { course: { id: courseId }, student: { id: studentId } },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found.');
    }

    enrollment.status = EnrollmentStatus.DROPPED;
    return  this.studentEnrollmentRepository.save(enrollment)
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
