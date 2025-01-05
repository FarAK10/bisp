// submissions/submissions.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@modules/user/entities/user.entity';
import { Assignment } from '../entities/assignment.entity';
import { Submission } from '../entities/submissionn.entity';
import { AssignmentsService } from './assignment.service';
import { UserService } from '@modules/user/services/user.service';
import { StudentEnrollment } from '@modules/course/entities/student-entrollment.entity';

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectRepository(Submission)
    private submissionsRepository: Repository<Submission>,
    private assignmentService: AssignmentsService,
    private userService: UserService,
    @InjectRepository(StudentEnrollment)
    private studentEnrollmentRepository: Repository<StudentEnrollment>,
  ) {}

  // Submit an assignment
  async submitAssignment(
    studentId: number,
    assignmentId: number,
    file: Express.Multer.File,
  ): Promise<Submission> {
    // 1) Remove "course.students" from relations
    const assignment = await this.assignmentService.getAssignmentById(
      assignmentId,
      ['course', 'course.professor'], // if you need the professor
    );

    if (!assignment) {
      throw new NotFoundException('Assignment not found.');
    }

    // 2) Check enrollment via StudentEnrollment pivot table
    const enrollment = await this.studentEnrollmentRepository.findOne({
      where: {
        course: { id: assignment.course.id },
        student: { id: studentId },
      },
    });

    const isEnrolled = !!enrollment;
    if (!isEnrolled) {
      throw new ForbiddenException('You are not enrolled in this course.');
    }

    // 3) Check if the assignment is past due
    if (new Date() > assignment.dueDate) {
      throw new ForbiddenException('The assignment submission is past due.');
    }

    // 4) Check if the student has already submitted
    const existingSubmission = await this.submissionsRepository.findOne({
      where: {
        assignment: { id: assignmentId },
        student: { id: studentId },
      },
    });

    if (existingSubmission) {
      // Optionally, allow resubmission by removing the old submission
      await this.submissionsRepository.remove(existingSubmission);
    }

    // 5) Create and save a new submission
    const submission = this.submissionsRepository.create({
      assignment,
      student: { id: studentId },
      filePath: file.path,
      originalFileName: file.originalname,
    });

    return await this.submissionsRepository.save(submission);
  }

  // Get submissions for an assignment (Professor)
  async getSubmissionsForAssignment(
    professorId: number,
    assignmentId: number,
  ): Promise<Submission[]> {
    const assignment = await this.assignmentService.getAssignmentById(
      assignmentId,
      ['course', 'course.professor'],
    );

    if (assignment.course.professor.id !== professorId) {
      throw new ForbiddenException(
        'You are not authorized to view submissions for this assignment.',
      );
    }

    return await this.submissionsRepository.find({
      where: { assignment: { id: assignmentId } },
      relations: ['student'],
      order: { submittedAt: 'ASC' },
    });
  }

  // Get submission by ID (Student or Professor)
  async getSubmissionById(
    submissionId: number,
    relations: string[] = [
      'assignment',
      'assignment.course',
      'assignment.course.professor',
      'student',
    ],
  ): Promise<Submission> {
    const submission = await this.submissionsRepository.findOne({
      where: { id: submissionId },
      relations,
    });
    if (!submission) {
      throw new NotFoundException('Submission not found.');
    }

    return submission;
  }

  async getSubmissionByIdForProffessor(
    proffessorId: number,

    submissionId: number,
  ): Promise<Submission> {
    const submission = await this.getSubmissionById(submissionId, [
      'assignment',
      'assignment.course',
      'assignment.course.professor',
    ]);
    if (submission.assignment.course.professor.id !== proffessorId) {
      throw new ForbiddenException(
        'You are not authorized to view this submission.',
      );
    }

    if (!submission) {
      throw new NotFoundException('Submission not found.');
    }

    return submission;
  }
  // Grade a submission
  async gradeSubmission(
    professorId: number,
    submissionId: number,
    grade: number,
    feedback?: string,
  ): Promise<Submission> {
    const submission = await this.getSubmissionById(submissionId, [
      'assignment',
      'assignment.course',
      'assignment.course.professor',
    ]);

    if (submission.assignment.course.professor.id !== professorId) {
      throw new ForbiddenException(
        'You are not authorized to grade this submission.',
      );
    }

    submission.grade = grade;
    submission.feedback = feedback;

    return await this.submissionsRepository.save(submission);
  }
}
