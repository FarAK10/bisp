import { Module } from '@nestjs/common';
import { CourseController } from './controllers/course.contoller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CourseService } from './services/course.service';
import { UserModule } from '@modules/user/user.module';
import { StudentEnrollment } from './entities/student-entrollment.entity';
import { ScheduleModule } from '@modules/schedule/schedule.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, StudentEnrollment]),
    UserModule,
    ScheduleModule,
  ],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [
    CourseService,
    TypeOrmModule.forFeature([Course, StudentEnrollment]),
  ],
})
export class CourseModule {}
