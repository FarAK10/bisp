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

  // Remove or comment out the ManyToMany if you're using the new pivot table
  // @ManyToMany(() => User, (user) => user.coursesEnrolled)
  // @JoinTable({
  //   name: 'course_students',
  //   joinColumn: { name: 'course_id', referencedColumnName: 'id' },
  //   inverseJoinColumn: { name: 'student_id', referencedColumnName: 'id' },
  // })
  // students: User[];

  @OneToMany(() => Assignment, (assignment) => assignment.course)
  assignments: Assignment[];

  @OneToMany(() => Lecture, (lecture) => lecture.course)
  lectures: Lecture[];

  @OneToMany(() => AttendanceRecord, (record) => record.course)
  attendaceRecords: AttendanceRecord[];

  // New relationship to the StudentEnrollment entity
  @OneToMany(() => StudentEnrollment, (enrollment) => enrollment.course)
  enrollments: StudentEnrollment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
