// submissions/submissions.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '@modules/user/entities/user.entity';
import { Assignment } from '../entities/assignment.entity';
import { Submission } from '../entities/submissionn.entity';
import { AssignmentsService } from './assignment.service';
import { UserService } from '@modules/user/services/user.service';
import { StudentEnrollment } from '@modules/course/entities/student-entrollment.entity';
import { SubmissionFile } from '../entities/submission-file.entity';

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectRepository(Submission)
    private submissionsRepository: Repository<Submission>,
    private assignmentService: AssignmentsService,
    private userService: UserService,
    @InjectRepository(StudentEnrollment)
    private studentEnrollmentRepository: Repository<StudentEnrollment>,
    @InjectRepository(SubmissionFile)
    private submissionFileRepository: Repository<SubmissionFile>,
    private dataSource:DataSource,
  ) {}

  async submitAssignment(
    studentId: number,
    assignmentId: number,
    file: Express.Multer.File
  ) {
    await this.dataSource.transaction(async (manager) => {
      let submission = await manager.findOne(Submission, {
        where: {
          student: { id: studentId },
          assignment: { id: assignmentId }
        },
        relations: ['files']
      });
  
      if (!submission) {
        submission = manager.create(Submission, {
          student: { id: studentId },
          assignment: { id: assignmentId },
        });
        submission = await manager.save(Submission, submission);
      }
  
      const submissionFile = manager.create(SubmissionFile, {
        submission: submission,
        filePath: file.path,
        originalFileName: file.originalname,
        fileType: file.mimetype,
      });
  
      await manager.save(SubmissionFile, submissionFile);
  
      
  
      return await manager.findOne(Submission, {
        where: { id: submission.id },
        relations: ['files', 'student']
      });
    });
  
  }

  async getSubmissionFile(
    userId: number,
    fileId: number,
  ) {
    const file = await this.submissionFileRepository.findOne({
      where: { id: fileId },
      relations: [],
    });

    if (!file) {
      throw new NotFoundException('Submission file not found');
    }


    return file;
  }
  async getStudentSubmissionByAssignment(
    studentId: number,
    assignmentId: number,
  ): Promise<Submission> {
    // Check if assignment exists
    const assignment = await this.assignmentService.getAssignmentById(
      assignmentId,
      ['course', 'course.professor'],
    );

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

   
    const submission = await this.submissionsRepository.findOne({
      where: {
        student: { id: +studentId },
        assignment: { id: +assignmentId },
      },
      relations: [
        'student',
        'files',
        'assignment',

      ],
    });
  

    // Return null if no submission found (this is not an error case)
    return submission;
  }

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
