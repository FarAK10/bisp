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

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private userService: UserService,
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

  async findAll(): Promise<Course[]> {
    return this.courseRepository.find({ relations: ['professor', 'students'] });
  }

  async findOne(id: number): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['professor', 'students'],
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

  async enrollStudent(courseId: number, studentId: number): Promise<Course> {
    const course = await this.findOne(courseId);
    const student = await this.userService.findOne(studentId);

    if (!student || !student.roles.includes(Role.Student)) {
      throw new NotFoundException('Student not found.');
    }

    course.students = course.students
      ? [...course.students, student]
      : [student];
    return this.courseRepository.save(course);
  }

  async unenrollStudent(courseId: number, studentId: number): Promise<Course> {
    const course = await this.findOne(courseId);

    course.students = course.students.filter(
      (student) => student.id !== studentId,
    );
    return this.courseRepository.save(course);
  }
}
