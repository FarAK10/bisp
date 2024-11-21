import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AttendanceDate } from './attendance-date.entity';
import { User } from '@modules/user/entities/user.entity';
import { Course } from '@modules/course/entities/course.entity';

@Entity('attendance_records')
export class AttendanceRecord {
  @PrimaryGeneratedColumn()
  record_id: number;

  @ManyToOne(() => AttendanceDate, (date) => date.records)
  @JoinColumn({ name: 'date_id' })
  date: AttendanceDate;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student: User;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({ type: 'varchar', length: 50 })
  attendance_status: string;

  @Column({ type: 'varchar', length: 50 })
  tracking_method: string;
}
