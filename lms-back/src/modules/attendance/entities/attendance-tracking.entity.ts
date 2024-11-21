import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { AttendanceDate } from './attendance-date.entity';
import { User } from '@modules/user/entities/user.entity';

@Entity('attendance_tracking')
export class AttendanceTracking {
  @PrimaryGeneratedColumn()
  tracking_id: number;

  @ManyToOne(() => AttendanceDate, (date) => date.trackings)
  @JoinColumn({ name: 'date_id' })
  date: AttendanceDate;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student: User;

  @Column({ type: 'timestamp', nullable: true })
  entry_time: Date;

  @Column({ type: 'timestamp', nullable: true })
  exit_time: Date;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  total_hours: number;

  @Column({ type: 'varchar', length: 50 })
  tracking_method: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  device_identifier: string;
}
