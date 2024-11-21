// assignments/assignments.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '@modules/course/entities/course.entity';
import { CourseService } from '@modules/course/services/course.service';
import { Assignment } from '../entities/assignment.entity';
import { CreateAssignmentDto, UpdateAssignmentDto } from '../dto';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private assignmentRepository: Repository<Assignment>,
    private courseService: CourseService,
  ) {}

  // Create an assignment within a course
  async createAssignment(
    professorId: number,
    courseId: number,
    createAssignmentDto: CreateAssignmentDto,
  ): Promise<Assignment> {
    const course = await this.courseService.findOne(courseId, ['professor']);
    const isEnrolled = course.students.some(
      (student) => student.id === professorId,
    );
    if (course.professor.id !== professorId && !isEnrolled) {
      throw new ForbiddenException(
        'You are not authorized to add assignments to this course.',
      );
    }

    const assignment = this.assignmentRepository.create({
      course,
      title: createAssignmentDto.title,
      description: createAssignmentDto.description,
      dueDate: createAssignmentDto.dueDate,
      createdAt: new Date(),
    });

    return await this.assignmentRepository.save(assignment);
  }

  // Get assignments for a course
  async getAssignmentsByCourse(
    userId: number,
    courseId: number,
  ): Promise<Assignment[]> {
    const course = await this.courseService.findOne(courseId, [
      'professor',
      'students',
    ]);

    return await this.assignmentRepository.find({
      where: { course: { id: courseId } },
      order: { dueDate: 'ASC' },
    });
  }

  // Get a single assignment
  async getAssignmentById(
    assignmentId: number,
    relations: string[] = ['course', 'course.students', 'course.professor'],
  ): Promise<Assignment> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: relations,
    });
    if (!assignment) {
      throw new NotFoundException('Assignment not found.');
    }

    return assignment;
  }

  // Update an assignment
  async updateAssignment(
    professorId: number,
    assignmentId: number,
    updateAssignmentDto: UpdateAssignmentDto,
  ): Promise<Assignment> {
    const assignment = await this.getAssignmentById(assignmentId, [
      'course',
      'course.professor',
    ]);

    Object.assign(assignment, updateAssignmentDto);
    const course = assignment.course;
    const isEnrolled = course.students.some(
      (student) => student.id === professorId,
    );
    const isProfessor = course.professor.id === professorId;

    if (!isEnrolled && !isProfessor) {
      throw new ForbiddenException('Access denied to this assignment.');
    }
    return await this.assignmentRepository.save(assignment);
  }

  // Delete an assignment
  async deleteAssignment(
    professorId: number,
    assignmentId: number,
  ): Promise<void> {
    const assignment = await this.getAssignmentById(assignmentId, [
      'course',
      'course.professor',
    ]);

    if (assignment.course.professor.id !== professorId) {
      throw new ForbiddenException(
        'You are not authorized to delete this assignment.',
      );
    }

    await this.assignmentRepository.remove(assignment);
  }
}
