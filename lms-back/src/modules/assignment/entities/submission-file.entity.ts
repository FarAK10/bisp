import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
  } from 'typeorm';
import { Submission } from './submissionn.entity';
  
  @Entity('submission_files')
  export class SubmissionFile {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => Submission, (submission) => submission.files)
    submission: Submission;
  
    @Column()
    filePath: string;
  m
    @Column()
    originalFileName: string;
  
    @CreateDateColumn()
    uploadedAt: Date;
  }