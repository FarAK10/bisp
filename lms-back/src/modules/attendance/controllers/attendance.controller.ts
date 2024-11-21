import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateAttendanceRecordDto } from '../dto/attendance-record/create-attendance-record.dto';
import { CreateAttendanceTrackingDto } from '../dto/attendance-tracking/create-attendance-tracking.dto';
import { AttendanceService } from '../services/attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('nfc-entry')
  async createNfcEntry(
    @Body() createAttendanceDto: CreateAttendanceTrackingDto,
  ) {
    return this.attendanceService.createAttendanceTracking(createAttendanceDto);
  }

  @Post('qr-record')
  async createQrAttendance(
    @Body() createAttendanceRecordDto: CreateAttendanceRecordDto,
  ) {
    return this.attendanceService.createAttendanceRecord(
      createAttendanceRecordDto,
    );
  }

  @Get('total-hours/:studentId')
  async getTotalHours(
    @Param('studentId') studentId: number,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return this.attendanceService.getStudentTotalHours(
      studentId,
      startDate,
      endDate,
    );
  }

  @Get('records/:studentId')
  async getAttendanceRecords(
    @Param('studentId') studentId: number,
    @Query('courseId') courseId?: number,
  ) {
    return this.attendanceService.getStudentAttendanceRecords(
      studentId,
      courseId,
    );
  }
}
