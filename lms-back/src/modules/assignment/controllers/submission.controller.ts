// submissions/submissions.controller.ts
import {
  Controller,
  Post,
  Get,
  UseGuards,
  Req,
  Param,
  Body,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/role.decorator';
import { Role } from '@common/constants/roles.enum';
import { editFileName } from '@common/utils/edit-file-name';
import { fileFilter } from '@common/filters/file-filter';
import { SubmissionsService } from '../services/submission.service';

@UseGuards(RolesGuard)
@Controller('assignments/:assignmentId/submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  // Students submit assignments
  @Roles(Role.Professor)
  @Post('submit')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/submissions',
        filename: editFileName,
      }),
      fileFilter: fileFilter,
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    }),
  )
  async submitAssignment(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
    @Param('assignmentId') assignmentId: number,
  ) {
    const studentId = req.user.id;
    return await this.submissionsService.submitAssignment(
      studentId,
      assignmentId,
      file,
    );
  }

  // Professors get submissions for an assignment
  @Roles(Role.Professor)
  @Get()
  async getSubmissionsForAssignment(
    @Req() req,
    @Param('assignmentId') assignmentId: number,
  ) {
    const professorId = req.user.id;
    return await this.submissionsService.getSubmissionsForAssignment(
      professorId,
      assignmentId,
    );
  }

  // Get a single submission
  @Get(':submissionId')
  async getSubmissionById(
    @Req() req,
    @Param('submissionId') submissionId: number,
  ) {
    const userId = req.user.id;

    return await this.submissionsService.getSubmissionById(submissionId);
  }

  // Download submission file
  @Get(':submissionId/download')
  async downloadSubmission(
    @Req() req,
    @Param('submissionId') submissionId: number,
    @Res() res: Response,
  ) {
    const userId = req.user.id;
    const submission =
      await this.submissionsService.getSubmissionByIdForProffessor(
        userId,
        submissionId,
      );
    res.sendFile(submission.filePath, { root: './' }, (err) => {
      if (err) {
        res.status(500).send('Error downloading file.');
      }
    });
  }

  // Professors grade submissions
  @Roles(Role.Professor)
  @Post(':submissionId/grade')
  async gradeSubmission(
    @Req() req,
    @Param('submissionId') submissionId: number,
    @Body() body: { grade: number; feedback?: string },
  ) {
    const professorId = req.user.id;
    const { grade, feedback } = body;
    return await this.submissionsService.gradeSubmission(
      professorId,
      submissionId,
      grade,
      feedback,
    );
  }
}
