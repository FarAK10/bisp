import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { CourseModule } from '@modules/course/course.module';
import JwtModule from './config/jwt';
import DbModule from './config/db';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@common/guards/auth.guard';
import { AuthModule } from '@modules/auth/auth.module';
import { RolesGuard } from '@common/guards/roles.guard';
import { LectureModule } from '@modules/lecture/lecture.module';
import { AssignmentModule } from '@modules/assignment/assignment.module';
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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
