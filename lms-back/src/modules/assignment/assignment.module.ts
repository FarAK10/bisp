import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assignment } from './entities/assignment.entity';
import { Submission } from './entities/submissionn.entity';
import { CourseModule } from '@modules/course/course.module';
import { AssignmentsService } from './services/assignment.service';
import { SubmissionsService } from './services/submission.service';
import { UserModule } from '@modules/user/user.module';
import { AssignmentsController } from './controllers/assignment.controller';
import { SubmissionsController } from './controllers/submission.controller';
import { StudentEnrollment } from '@modules/course/entities/student-entrollment.entity';
import { SubmissionFile } from './entities/submission-file.entity';
import { AssignmentFile } from './entities/assigment-file.entity';
import { AssignmentFilesController } from './controllers/assigmnet-file.controller';
import { AssignmentFilesService } from './services/assignment-file.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Assignment, Submission, StudentEnrollment,SubmissionFile,AssignmentFile]),
    CourseModule,
    UserModule,
  ],
  controllers: [AssignmentsController, SubmissionsController,AssignmentFilesController],
  providers: [AssignmentsService, SubmissionsService,AssignmentFilesService],
  exports: [
    AssignmentsService,
    SubmissionsService,
    TypeOrmModule.forFeature([Assignment, Submission]),
    AssignmentFilesService,
  ],
})
export class AssignmentModule {}
