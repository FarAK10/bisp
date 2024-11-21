import { CourseModule } from '@modules/course/course.module';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceRecord } from './entities/attendacne-record.entity';
import { AttendanceDate } from './entities/attendance-date.entity';
import { AttendanceTracking } from './entities/attendance-tracking.entity';
import { AttendanceService } from './services/attendance.service';
import { AttendanceController } from './controllers/attendance.controller';

@Module({
  imports: [
    UserModule,
    CourseModule,
    TypeOrmModule.forFeature([
      AttendanceRecord,
      AttendanceDate,
      AttendanceTracking,
    ]),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
