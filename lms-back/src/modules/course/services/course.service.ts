import { Role } from '@common/constants/roles.enum';
import { User } from '@modules/user/entities/user.entity';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
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

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private userService: UserService,
    @InjectRepository(StudentEnrollment)
    private studentEnrollmentRepository: Repository<StudentEnrollment>,
  ) {}

  async create(
    createCourseDto: CreateCourseDto,
    professorId: number,
  ): Promise<Course> {
    const professor = await this.userService.findOne(professorId);

    if (!professor || professor.roles.includes(Role.Student)) {
      throw new ForbiddenException('Only professors can create courses.');
    }

    const course = this.courseRepository.create({
      ...createCourseDto,
      professor,
    });

    return this.courseRepository.save(course);
  }

  async findAll(
    page?: number,
    limit?: number,
  ): Promise<CourseTableResponseDto> {
    if (!page || !limit) {
      const [data, count] = await this.courseRepository.findAndCount({
        relations: ['professor'],
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
    relations: string[] = ['professor', 'students'],
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
    id: number,
    updateCourseDto: UpdateCourseDto,
    user: User,
  ): Promise<Course> {
    const course = await this.findOne(id);

    await this.courseRepository.update(id, updateCourseDto);
    return this.findOne(id);
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
}
