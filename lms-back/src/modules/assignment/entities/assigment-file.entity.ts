import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
  } from 'typeorm';
  import { Assignment } from './assignment.entity';
  
  @Entity('assignment_files')
  export class AssignmentFile {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => Assignment, (assignment) => assignment.files)
    assignment: Assignment;
  
    @Column({nullable:true})
    filePath: string;
  
    @Column()
    originalFileName: string;
  
    @Column()
    fileType: string;

    
  
    @CreateDateColumn()
    uploadedAt: Date;
  }
  