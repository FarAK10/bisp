// events/entities/event.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '@modules/user/entities/user.entity';
import { Lecture } from '@modules/lecture/entities';
import { Course } from '@modules/course/entities/course.entity';

export enum EventType {
  Lecture = 'lecture',
  Seminar = 'seminar',
}

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Course, (course) => course.schedules)
  course: Course;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column()
  dayOfWeek: number; // 0-6 (Sunday-Saturday)

  @Column({ enum: EventType })
  type: EventType;

  @Column()
  roomNumber: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
