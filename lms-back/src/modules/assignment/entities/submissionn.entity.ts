// submissions/entities/submission.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '@modules/user/entities/user.entity';
import { Assignment } from './assignment.entity';
import { SubmissionFile } from './submission-file.entity';
@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Assignment, (assignment) => assignment.submissions)
  assignment: Assignment;

  @ManyToOne(() => User, (user) => user.submissions)
  student: User;
  @OneToMany(() => SubmissionFile, (file) => file.submission, {
    cascade: true,
    eager: true,
  })
  files: SubmissionFile[];

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
