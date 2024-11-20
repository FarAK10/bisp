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

  @Column()
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

  @OneToMany(() => Schedule, (schedule) => schedule.lecture)
  schedules: Schedule[];
  @ManyToOne(() => Lecture, (lecture) => lecture.lectureMaterials)
  lecture: Lecture;

  @ManyToOne(() => Course, (course) => course.professor)
  uploadedBy: User;
}
