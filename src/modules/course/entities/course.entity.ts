import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '@modules/user/entities/user.entity';
import { Lecture } from '@modules/lecture/entities/lecture.entity';
import { Assignment } from '@modules/assignment/entities/assignment.entity';

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

  @ManyToMany(() => User, (user) => user.coursesEnrolled)
  @JoinTable({
    name: 'course_students',
    joinColumn: { name: 'course_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'student_id', referencedColumnName: 'id' },
  })
  students: User[];

  @OneToMany(() => Assignment, (assignment) => assignment.course)
  assignments: Assignment[];
  @OneToMany(() => Lecture, (lecture) => lecture.course)
  lectures: Lecture[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
