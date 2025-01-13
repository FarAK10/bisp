import { Course } from '@modules/course/entities/course.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Submission } from './submissionn.entity';
import { AssignmentFile } from './assigment-file.entity';

@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  dueDate: Date;

  @ManyToOne(() => Course, (course) => course.assignments)
  course: Course;
  
  @OneToMany(() => AssignmentFile, file => file.assignment, {
    cascade: true,  
    onDelete: 'CASCADE' 
})
files: AssignmentFile[];

  @OneToMany(() => Submission, (submission) => submission.assignment, {
    cascade: true,
  })
  submissions: Submission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
