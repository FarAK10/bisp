// lecture-material.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '@modules/user/entities/user.entity';
import { Lecture } from '@modules/lecture/entities/lecture.entity';
import { Course } from '@modules/course/entities/course.entity';
import { Schedule } from '@modules/schedule/enitites/event.entity';

@Entity('lecture_materials')
export class LectureMaterial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true }) // Make title optional
  title: string;

  @Column()
  originalName: string;

  @Column()
  filename: string;

  @Column()
  filePath: string;

  @Column()
  mimetype: string;

  @CreateDateColumn()
  uploadedAt: Date;

  @ManyToOne(() => Lecture, (lecture) => lecture.lectureMaterials, {
    onDelete: 'CASCADE' 
  })  lecture: Lecture;

  @ManyToOne(() => User)
  uploadedBy: User;

}
