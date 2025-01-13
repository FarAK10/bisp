// assignments/services/assignment-files.service.ts

import { Injectable, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from '../entities/assignment.entity';

import { promises as fs } from 'fs';
import { join } from 'path';import { AssignmentFile } from '../entities/assigment-file.entity';
import { AssignmentsService } from './assignment.service';

@Injectable()
export class AssignmentFilesService {
  constructor(
    @InjectRepository(Assignment)
    private assignmentRepository: Repository<Assignment>,
    @InjectRepository(AssignmentFile)
    private assignmentFileRepository: Repository<AssignmentFile>,
  ) {}

  async uploadFile(
    professorId: number,
    assignmentId: number,
    file: Express.Multer.File
): Promise<AssignmentFile> {
    // First save metadata to get the ID
    const assignment = await this.assignmentRepository.findOne({
        where: { id: assignmentId },
        relations: ['course', 'course.professor']
    });

    if (!assignment) {
        throw new NotFoundException('Assignment not found');
    }

    if (assignment.course.professor.id !== professorId) {
        throw new ForbiddenException('You are not authorized to upload files for this assignment.');
    }

    try {
        const assignmentFile = this.assignmentFileRepository.create({
            assignment: assignment,
            originalFileName: file.originalname,
            filePath: file.path,
            fileType: file.mimetype
        });

        const savedFile = await this.assignmentFileRepository.save(assignmentFile);



        return await this.assignmentFileRepository.save(savedFile);

    } catch (error) {
        console.error('File upload error:', error);
        throw new InternalServerErrorException('Failed to upload file');
    }
}

  async getFileById(userId: number, fileId: number): Promise<AssignmentFile> {
    const file = await this.assignmentFileRepository.findOne({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException('File not found.');
    }

    

    return file;
  }

  async deleteFileById(professorId: number, fileId: number): Promise<void> {
    const file = await this.assignmentFileRepository.findOne({
      where: { id: fileId },
      relations: ['assignment', 'assignment.course', 'assignment.course.professor'],
    });

    if (!file) {
      throw new NotFoundException('File not found.');
    }

    if (file.assignment.course.professor.id !== professorId) {
      throw new ForbiddenException('You are not authorized to delete this file.');
    }

    // Delete the file from the filesystem
    try {
      await fs.unlink(file.filePath);
    } catch (error) {
      console.error('Error deleting file from filesystem:', error);
    }

    await this.assignmentFileRepository.remove(file);
  }
}