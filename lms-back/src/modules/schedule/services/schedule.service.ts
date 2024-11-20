import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CreateScheduleDto } from '../dto/create-schedule.dto';
import { Schedule } from '../enitites/event.entity';
import { UpdateScheduleDto } from '../dto/update-schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
  ) {}

  async create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    // Check for schedule conflicts
    const conflicts = await this.checkScheduleConflicts(
      createScheduleDto.startTime,
      createScheduleDto.endTime,
      createScheduleDto.dayOfWeek,
      createScheduleDto.roomNumber,
    );

    if (conflicts) {
      throw new ConflictException('Schedule conflict detected');
    }

    const schedule = this.scheduleRepository.create(createScheduleDto);
    return this.scheduleRepository.save(schedule);
  }
  async update(
    scheduleId: number,
    updateScheduleDto: UpdateScheduleDto,
  ): Promise<Schedule> {
    const existingSchedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId },
    });

    if (!existingSchedule) {
      throw new NotFoundException(`Schedule with ID ${scheduleId} not found`);
    }

    // Check for conflicts excluding the current schedule
    const hasConflict = await this.checkScheduleConflicts(
      updateScheduleDto.startTime,
      updateScheduleDto.endTime,
      updateScheduleDto.dayOfWeek,
      updateScheduleDto.roomNumber,
    );

    if (hasConflict) {
      throw new ConflictException(
        `Schedule conflict detected for room ${updateScheduleDto.roomNumber} at the specified time`,
      );
    }

    Object.assign(existingSchedule, updateScheduleDto);
    return await this.scheduleRepository.save(existingSchedule);
  }
  async checkScheduleConflicts(
    startTime: Date,
    endTime: Date,
    dayOfWeek: number,
    roomNumber: string,
  ): Promise<boolean> {
    const conflictingSchedules = await this.scheduleRepository.find({
      where: {
        dayOfWeek,
        roomNumber,
        startTime: Between(startTime, endTime),
      },
    });

    return conflictingSchedules.length > 0;
  }

  async findAll(): Promise<Schedule[]> {
    return this.scheduleRepository.find({
      relations: ['lecture'],
    });
  }

  async findByWeek(weekStart: Date): Promise<Schedule[]> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return this.scheduleRepository.find({
      where: {
        startTime: Between(weekStart, weekEnd),
      },
      relations: ['lecture'],
      order: {
        startTime: 'ASC',
      },
    });
  }
  async deleteSchedules(schedules: Schedule[]): Promise<void> {
    await this.scheduleRepository.remove(schedules);
  }
}
