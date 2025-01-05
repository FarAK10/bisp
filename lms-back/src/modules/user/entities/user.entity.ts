// user.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Course } from '@modules/course/entities/course.entity';
import { Submission } from '@modules/assignment/entities/submissionn.entity';
import { AttendanceTracking } from '@modules/attendance/entities/attendance-tracking.entity';
import { AttendanceRecord } from '@modules/attendance/entities/attendacne-record.entity';
import { Badge } from '@modules/gamification/entities/badge.entity';
import { Role } from '@common/constants/roles.enum';
import { StudentEnrollment } from '@modules/course/entities/student-entrollment.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @OneToMany(() => Course, (course) => course.professor)
  coursesTaught: Course[];

  // Remove or comment out the ManyToMany
  // @ManyToMany(() => Course, (course) => course.students)
  // coursesEnrolled: Course[];

  @OneToMany(() => Submission, (submission) => submission.student)
  submissions: Submission[];

  @OneToMany(() => Course, (course) => course.professor)
  coursesLead: Course[];

  @OneToMany(() => AttendanceTracking, (tracking) => tracking.student)
  attendanceTrackings: AttendanceTracking[];

  @OneToMany(() => AttendanceRecord, (record) => record.student)
  attendanceRecords: AttendanceRecord[];

  @OneToMany(() => Badge, (badge) => badge.users)
  badges: Badge[];

  // New relationship to the StudentEnrollment entity
  @OneToMany(() => StudentEnrollment, (enrollment) => enrollment.student)
  enrollments: StudentEnrollment[];

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'enum',
    enum: Role,
    array: true,
    default: [Role.Student],
  })
  roles: Role[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
