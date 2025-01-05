import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Role } from '@common/constants/roles.enum'; // Assuming Role is an enum
import { Course } from '@modules/course/entities/course.entity';
import { Submission } from '@modules/assignment/entities/submissionn.entity';
import { AttendanceTracking } from '@modules/attendance/entities/attendance-tracking.entity';
import { AttendanceRecord } from '@modules/attendance/entities/attendacne-record.entity';
import { Badge } from '@modules/gamification/entities/badge.entity';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @OneToMany(() => Course, (course) => course.professor)
  coursesTaught: Course[];

  @ManyToMany(() => Course, (course) => course.students)
  coursesEnrolled: Course[];

  @OneToMany(() => Submission, (submission) => submission.student)
  submissions: Submission[];

  @OneToMany(() => AttendanceTracking, (tracking) => tracking.student)
  attendanceTrackings: AttendanceTracking[];

  @OneToMany(() => AttendanceRecord, (record) => record.student)
  attendanceRecords: AttendanceRecord[];

  @OneToMany(() => Badge, (badge) => badge.users)
  badges: Badge[];

  @Column()
  password: string; // Password should be hashed

  @Column()
  firstName: string;

  @Column()
  lastName: string;
  @Column({
    type: 'enum',
    enum: Role,
    array: true,
    default: [Role.Student], // Default role can be set to Student
  })
  roles: Role[]; // A single role for each user

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
