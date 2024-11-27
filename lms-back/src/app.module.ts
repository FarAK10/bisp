import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { CourseModule } from '@modules/course/course.module';
import JwtModule from './config/jwt';
import DbModule from './config/db';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@common/guards/auth.guard';
import { AuthModule } from '@modules/auth/auth.module';
import { LectureModule } from '@modules/lecture/lecture.module';
import { AssignmentModule } from '@modules/assignment/assignment.module';
import { AttendanceModule } from '@modules/attendance/attendance.module';
import { GamificationModule } from '@modules/gamification/gamification.module';
@Module({
  imports: [
    ConfigModule.forRoot(), // Import ConfigModule to use environment variables
    JwtModule,
    DbModule,
    UserModule,
    CourseModule,
    AuthModule,
    LectureModule,
    AssignmentModule,
    AttendanceModule,
    GamificationModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
