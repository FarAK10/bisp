// src/attendance/attendance.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { CreateAttendanceRecordDto } from '../dto/attendance-record/create-attendance-record.dto';
import { AttendanceRecord } from '../entities/attendacne-record.entity';
import { AttendanceDate } from '../entities/attendance-date.entity';
import { AttendanceTracking } from '../entities/attendance-tracking.entity';
import { UserService } from '@modules/user/services/user.service';
import { CourseService } from '@modules/course/services/course.service';
import { CreateAttendanceTrackingDto } from '../dto/attendance-tracking/create-attendance-tracking.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceTracking)
    private attendanceTrackingRepo: Repository<AttendanceTracking>,
    @InjectRepository(AttendanceRecord)
    private attendanceRecordRepo: Repository<AttendanceRecord>,
    @InjectRepository(AttendanceDate)
    private attendanceDateRepo: Repository<AttendanceDate>,
    private userService: UserService,
    private courseService: CourseService,
  ) {}

  // Create or get existing attendance date
  private async getOrCreateAttendanceDate(date: Date): Promise<AttendanceDate> {
    let attendanceDate = await this.attendanceDateRepo.findOne({
      where: { attendance_date: date },
    });

    if (!attendanceDate) {
      attendanceDate = this.attendanceDateRepo.create({
        attendance_date: date,
      });
      await this.attendanceDateRepo.save(attendanceDate);
    }

    return attendanceDate;
  }

  // NFC Entry Tracking
  async createAttendanceTracking(
    dto: CreateAttendanceTrackingDto,
  ): Promise<AttendanceTracking> {
    // Find student
    const student = await this.userService.findOne(dto.student_id);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Get or create attendance date
    const attendanceDate = await this.getOrCreateAttendanceDate(
      new Date(dto.entry_time),
    );

    // Create tracking entry
    const tracking = this.attendanceTrackingRepo.create({
      date: attendanceDate,
      student,
      entry_time: dto.entry_time,
      exit_time: dto.exit_time,
      tracking_method: dto.tracking_method,
      device_identifier: dto.device_identifier,
    });

    return this.attendanceTrackingRepo.save(tracking);
  }

  // QR Code Attendance Record
  async createAttendanceRecord(
    dto: CreateAttendanceRecordDto,
  ): Promise<AttendanceRecord> {
    // Find student and course
    const student = await this.userService.findOne(dto.student_id);
    const course = await this.courseService.findOne(dto.course_id, []);

    if (!student) {
      throw new NotFoundException('Student not found');
    }
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Get or create attendance date
    const attendanceDate = await this.getOrCreateAttendanceDate(new Date());

    // Create attendance record
    const record = this.attendanceRecordRepo.create({
      date: attendanceDate,
      student,
      course,
      attendance_status: dto.attendance_status,
      tracking_method: dto.tracking_method,
    });

    return this.attendanceRecordRepo.save(record);
  }

  // Get Total Hours for a Student
  async getStudentTotalHours(
    studentId: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<number> {
    const query = this.attendanceTrackingRepo
      .createQueryBuilder('tracking')
      .select('SUM(tracking.total_hours)', 'total_hours')
      .where('tracking.student_id = :studentId', { studentId });

    if (startDate) {
      query.andWhere('tracking.entry_time >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('tracking.entry_time <= :endDate', { endDate });
    }

    const result = await query.getRawOne();
    return parseFloat(result.total_hours) || 0;
  }

  // Get Attendance Records for a Student
  async getStudentAttendanceRecords(
    studentId: number,
    courseId?: number,
  ): Promise<AttendanceRecord[]> {
    const query: FindManyOptions<AttendanceRecord> = {
      where: {
        student: { id: studentId },
      },
      relations: ['course', 'date'],
    };

    if (courseId) {
      query.where['course'] = { course_id: courseId };
    }

    return this.attendanceRecordRepo.find(query);
  }
}
