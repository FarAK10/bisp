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

@Module({
  imports: [
    TypeOrmModule.forFeature([Assignment, Submission]),
    CourseModule,
    UserModule,
  ],
  controllers: [AssignmentsController, SubmissionsController],
  providers: [AssignmentsService, SubmissionsService],
  exports: [AssignmentsService, SubmissionsService],
})
export class AssignmentModule {}
