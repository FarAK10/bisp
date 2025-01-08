import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { CreateScheduleDto } from '../dto/create-schedule.dto';
import { ScheduleService } from '../services/schedule.service';
import { ApiResponse } from '@nestjs/swagger';
import { GetScheduleDto } from '../dto/get-scedule.dto';

@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.scheduleService.create(createScheduleDto);
  }

  @Get()
  @ApiResponse({ status: 200, type: GetScheduleDto, isArray: true })
  findAll() {
    return this.scheduleService.findAll();
  }

  @Get('week')
  findByWeek(@Query('weekStart') weekStart: Date) {
    return this.scheduleService.findByWeek(weekStart);
  }
}
