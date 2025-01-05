import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@modules/user/entities/user.entity';
import { Course } from '@modules/course/entities/course.entity';

@Entity('student_enrollments')
export class StudentEnrollment {
  @PrimaryGeneratedColumn()
  enrollmentId: number;

  @ManyToOne(() => User, (user) => user.enrollments)
  @JoinColumn({ name: 'student_id' })
  student: User;

  @ManyToOne(() => Course, (course) => course.enrollments)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  enrollmentDate: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  status: string;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  finalGrade: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
