// submissions/entities/submission.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '@modules/user/entities/user.entity';
import { Assignment } from './assignment.entity';
@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Assignment, (assignment) => assignment.submissions)
  assignment: Assignment;

  @ManyToOne(() => User, (user) => user.submissions)
  student: User;

  @Column()
  filePath: string;

  @Column()
  originalFileName: string;

  @Column({ nullable: true })
  grade: number;

  @Column({ nullable: true })
  feedback: string;

  @CreateDateColumn()
  submittedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
