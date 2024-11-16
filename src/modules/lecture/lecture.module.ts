import { Module } from '@nestjs/common';
import { LecturesController } from './controllers/lecture.controller';
import { LectureMaterialsController } from './controllers/lecture-material.controller';
import { LectureService } from './services/lecture.service';
import { LectureMaterialsService } from './services/lecture-material.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LectureMaterial, Lecture } from './entities';
import { CourseModule } from '@modules/course/course.module';
import { UserModule } from '@modules/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lecture, LectureMaterial]),
    CourseModule,
    UserModule,
  ],
  controllers: [LecturesController, LectureMaterialsController],
  providers: [LectureService, LectureMaterialsService],
  exports: [LectureService, LectureMaterialsService],
})
export class LectureModule {}
