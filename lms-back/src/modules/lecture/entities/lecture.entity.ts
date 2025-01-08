import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from '@modules/course/entities/course.entity';
import { LectureMaterial } from './lecture-material.entity';
import { Schedule } from '@modules/schedule/enitites/event.entity';

@Entity('lectures')
export class Lecture {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Course, (course) => course.lectures)
  course: Course;

  @OneToMany(() => LectureMaterial, (material) => material.lecture)
  lectureMaterials: LectureMaterial[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
