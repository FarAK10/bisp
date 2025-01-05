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
import { User } from '@modules/user/entities/user.entity';
import { UserService } from '@modules/user/services/user.service';
import { LectureService } from './lecture.service';
import { StudentEnrollment } from '@modules/course/entities/student-entrollment.entity';
@Injectable()
export class LectureMaterialsService {
  constructor(
    @InjectRepository(LectureMaterial)
    private lectureMaterialsRepository: Repository<LectureMaterial>,
    private lectureService: LectureService,
    private userService: UserService,
    @InjectRepository(StudentEnrollment)
    private studentEnrollmentRepository: Repository<StudentEnrollment>,
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

  async getMaterialsByLecture(
    userId: number,
    lectureId: number,
  ): Promise<LectureMaterial[]> {
    // 1) We still fetch the lecture using lectureService.getLectureById
    //    but we do not rely on 'course.students' inside that method.
    const lecture = await this.lectureService.getLectureById(userId, lectureId);

    // 2) Check if this user is the professor
    const course = lecture.course;
    const isProfessor = course.professor.id === userId;

    // 3) Check if this user is enrolled via StudentEnrollment
    const enrollment = await this.studentEnrollmentRepository.findOne({
      where: {
        course: { id: course.id },
        student: { id: userId },
      },
    });
    const isStudent = !!enrollment;

    if (!isProfessor && !isStudent) {
      throw new ForbiddenException('Access denied to this lecture.');
    }

    // 4) Return materials
    return this.lectureMaterialsRepository.find({
      where: { lecture },
      relations: ['uploadedBy'],
      order: { uploadedAt: 'DESC' },
    });
  }

  // Get a single material
  async getMaterialById(
    userId: number,
    materialId: number,
  ): Promise<LectureMaterial> {
    // 1) Fetch material (without course.students)
    const material = await this.lectureMaterialsRepository.findOne({
      where: { id: materialId },
      relations: ['lecture', 'lecture.course', 'lecture.course.professor'],
    });

    if (!material) {
      throw new NotFoundException('Material not found.');
    }

    // 2) Check if user is professor or enrolled
    const course = material.lecture.course;
    const isProfessor = course.professor.id === userId;

    const enrollment = await this.studentEnrollmentRepository.findOne({
      where: {
        course: { id: course.id },
        student: { id: userId },
      },
    });
    const isStudent = !!enrollment;

    if (!isProfessor && !isStudent) {
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
