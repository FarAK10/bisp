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
    @Column()
    originalFileName: string;

    @Column()
    fileType:string;
  
    @CreateDateColumn()
    uploadedAt: Date;
  }