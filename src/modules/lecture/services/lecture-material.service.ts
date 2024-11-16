// lecture-materials/lecture-materials.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UploadedFile,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LectureMaterial } from '../entities/lecture-material.entity';
import { Repository } from 'typeorm';
import { Lecture } from '../entities/lecture.entity';
import { User } from '@modules/user/entities/user.entity';
import { UserService } from '@modules/user/services/user.service';
import { LectureService } from './lecture.service';
@Injectable()
export class LectureMaterialsService {
  constructor(
    @InjectRepository(LectureMaterial)
    private lectureMaterialsRepository: Repository<LectureMaterial>,
    private lectureService: LectureService,
    private userService: UserService,
  ) {}

  // Upload material to a lecture
  async uploadMaterial(
    professorId: number,
    lectureId: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<LectureMaterial> {
    const lecture = await this.lectureService.getLectureById(
      professorId,
      lectureId,
    );
    if (lecture.course.professor.id !== professorId) {
      throw new ForbiddenException(
        'You are not authorized to upload materials for this lecture.',
      );
    }

    const lectureMaterial = this.lectureMaterialsRepository.create({
      originalName: file.originalname,
      filename: file.filename,
      filePath: file.path,
      mimetype: file.mimetype,
      lecture,
      uploadedBy: { id: professorId } as User,
    });
    return await this.lectureMaterialsRepository.save(lectureMaterial);
  }

  // Get materials for a lecture
  async getMaterialsByLecture(
    userId: number,
    lectureId: number,
  ): Promise<LectureMaterial[]> {
    const lecture = await this.lectureService.getLectureById(userId, lectureId);

    const course = lecture.course;
    const isStudent = course.students.some((student) => student.id === userId);
    const isProfessor = course.professor.id === userId;

    if (!isStudent && !isProfessor) {
      throw new ForbiddenException('Access denied to this lecture.');
    }

    return await this.lectureMaterialsRepository.find({
      where: { lecture: lecture },
      relations: ['uploadedBy'],
      order: { uploadedAt: 'DESC' },
    });
  }

  // Get a single material
  async getMaterialById(
    userId: number,
    materialId: number,
  ): Promise<LectureMaterial> {
    const material = await this.lectureMaterialsRepository.findOne({
      where: { id: materialId },
      relations: [
        'lecture',
        'lecture.course',
        'lecture.course.students',
        'lecture.course.professor',
      ],
    });
    if (!material) {
      throw new NotFoundException('Material not found.');
    }

    const course = material.lecture.course;
    const isStudent = course.students.some((student) => student.id === userId);
    const isProfessor = course.professor.id === userId;

    if (!isStudent && !isProfessor) {
      throw new ForbiddenException('Access denied to this material.');
    }

    return material;
  }

  // Delete a material
  async deleteMaterial(professorId: number, materialId: number): Promise<void> {
    const material = await this.lectureMaterialsRepository.findOne({
      where: { id: materialId },
      relations: ['uploadedBy'],
    });
    if (!material) {
      throw new NotFoundException('Material not found.');
    }

    if (material.uploadedBy.id !== professorId) {
      throw new ForbiddenException(
        'You are not authorized to delete this material.',
      );
    }

    // Optionally, delete the file from storage
    // fs.unlinkSync(material.filePath);

    await this.lectureMaterialsRepository.remove(material);
  }
}
