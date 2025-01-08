import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Brackets } from 'typeorm';
import { CreateScheduleDto } from '../dto/create-schedule.dto';
import { Schedule } from '../enitites/event.entity';
import { UpdateScheduleDto } from '../dto/update-schedule.dto';
import { BaseScheduleDto } from '../dto/get-scedule.dto';

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
    const conflictsPromisses = await this.checkBatchScheduleConflicts([
      existingSchedule,
    ]);
    const conflicts = await Promise.all(conflictsPromisses);
    const hasConflict = conflicts.length > 0;
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
    const conflictingSchedules = await this.scheduleRepository
      .createQueryBuilder('schedule')
      .where('schedule.dayOfWeek = :dayOfWeek', { dayOfWeek })
      .andWhere('schedule.roomNumber = :roomNumber', { roomNumber })
      .andWhere(
        '(schedule.startTime < :endTime AND schedule.endTime > :startTime)',
        { startTime, endTime },
      )
      .getMany();

    return conflictingSchedules.length > 0;
  }
  async checkBatchScheduleConflicts<T extends BaseScheduleDto>(
    schedules: T[],
  ): Promise<
    { roomNumber: string; dayOfWeek: number; startTime: Date; endTime: Date }[]
  > {
    if (schedules.length === 0) {
      return [];
    }

    const queryBuilder = this.scheduleRepository.createQueryBuilder('schedule');

    // Add base condition to exclude checking against self
    queryBuilder.where('1 = 0'); // Start with false condition to properly chain ORs

    schedules.forEach((schedule, index) => {
      queryBuilder.orWhere(
        new Brackets((qb) => {
          const baseQuery = qb
            .where('schedule.dayOfWeek = :dayOfWeek' + index, {
              [`dayOfWeek${index}`]: schedule.dayOfWeek,
            })
            .andWhere('schedule.roomNumber = :roomNumber' + index, {
              [`roomNumber${index}`]: schedule.roomNumber,
            })
            .andWhere(
              '(schedule.startTime < :endTime' +
                index +
                ' AND schedule.endTime > :startTime' +
                index +
                ')',
              {
                [`startTime${index}`]: schedule.startTime,
                [`endTime${index}`]: schedule.endTime,
              },
            );

          // If schedule has an ID (meaning it's an update), exclude it from conflict check
          if (schedule['id']) {
            baseQuery.andWhere('schedule.id != :scheduleId' + index, {
              [`scheduleId${index}`]: schedule['id'],
            });
          }
        }),
      );
    });

    // Get conflicting schedules
    const conflicts = await queryBuilder.getMany();

    // Map conflicts to the required return type
    return conflicts.map((conflict) => ({
      roomNumber: conflict.roomNumber,
      dayOfWeek: conflict.dayOfWeek,
      startTime: conflict.startTime,
      endTime: conflict.endTime,
    }));
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
