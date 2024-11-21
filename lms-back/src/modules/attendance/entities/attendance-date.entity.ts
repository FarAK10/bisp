import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AttendanceTracking } from './attendance-tracking.entity';
import { AttendanceRecord } from './attendacne-record.entity';

@Entity('attendance_dates')
export class AttendanceDate {
  @PrimaryGeneratedColumn()
  date_id: number;

  @Column({ type: 'date', unique: true })
  attendance_date: Date;

  @OneToMany(() => AttendanceTracking, (tracking) => tracking.date)
  trackings: AttendanceTracking[];

  @OneToMany(() => AttendanceRecord, (record) => record.date)
  records: AttendanceRecord[];
}
