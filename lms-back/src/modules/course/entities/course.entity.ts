// course.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { User } from '@modules/user/entities/user.entity';
import { Assignment } from '@modules/assignment/entities/assignment.entity';
import { Lecture } from '@modules/lecture/entities/lecture.entity';
import { AttendanceRecord } from '@modules/attendance/entities/attendacne-record.entity';
import { StudentEnrollment } from './student-entrollment.entity';
import { Schedule } from '@modules/schedule/enitites/event.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => User, (user) => user.coursesTaught, { eager: true })
  professor: User;


  @OneToMany(() => Assignment, (assignment) => assignment.course)
  assignments: Assignment[];

  @OneToMany(() => Lecture, (lecture) => lecture.course)
  lectures: Lecture[];

  @OneToMany(() => Schedule, (schedule) => schedule.course)
  schedules: Schedule[];

  @OneToMany(() => AttendanceRecord, (record) => record.course)
  attendaceRecords: AttendanceRecord[];

  @OneToMany(() => StudentEnrollment, (enrollment) => enrollment.course)
  enrollments: StudentEnrollment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
