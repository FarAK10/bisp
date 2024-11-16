import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Role } from '@common/constants/roles.enum'; // Assuming Role is an enum
import { Course } from '@modules/course/entities/course.entity';
import { Lecture } from '@modules/lecture/entities/lecture.entity';
import { Submission } from '@modules/assignment/entities/submissionn.entity';

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

  @Column()
  password: string; // Password should be hashed

  @Column()
  name: string;

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
