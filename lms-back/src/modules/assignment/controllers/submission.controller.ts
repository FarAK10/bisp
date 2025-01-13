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
  UploadedFiles,
  ForbiddenException,
} from '@nestjs/common';

import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/role.decorator';
import { Role } from '@common/constants/roles.enum';
import { editFileName } from '@common/utils/edit-file-name';
import { fileFilter } from '@common/filters/file-filter';
import { SubmissionsService } from '../services/submission.service';
import { ApiBody, ApiConsumes, ApiOperation, ApiProduces, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { SubmissionTableResponseDto } from '../dto/submission/submission-table.response.dto';
import { SubmissionResponseDto } from '../dto/submission/submission-response.dto';
import { GradeSubmissionDto } from '../dto/submission/grade-submission.dto';

@UseGuards(RolesGuard)
@Controller('assignments/:assignmentId/submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  // Students submit assignments
  @Roles(Role.Student)
  @Post('submit')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
      description: 'Upload an assignment file (PDF, DOC, DOCX, XLS, XLSX)',
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: 'Allowed file types: .pdf, .doc, .docx, .xls, .xlsx',
          },
        },
      },
    })
  @UseInterceptors(
    FilesInterceptor('files', 10, { 
      storage: diskStorage({
        destination: './uploads/submissions',
        filename: editFileName,
      }),
      fileFilter: fileFilter,
      limits: { fileSize: 50 * 1024 * 1024 }, 
    }),
  )
  async submitAssignment(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req,
    @Param('assignmentId') assignmentId: number,
  ) {
    const studentId = req.user.id;
    return await this.submissionsService.submitAssignment(
      studentId,
      assignmentId,
      files,
    );
  }


  
 
  @Roles(Role.Professor)
  @Get()
  @ApiResponse({type:SubmissionResponseDto,isArray:true})
  async getSubmissionsForAssignment(
    @Req() req,
    @Param('assignmentId') assignmentId: number,
  ) :Promise<SubmissionResponseDto[]>{
    const professorId = req.user.id;
    const sumbmissions =  await this.submissionsService.getSubmissionsForAssignment(
      professorId,
      assignmentId,
    );
    return sumbmissions.map(submission=> {
       return {
        id: submission.id,
        files: submission.files,
        submittedAt: submission.submittedAt,
        submittedStudent: submission.student,
        updatedAt : submission.updatedAt,
      feedback: submission.feedback,
      grade : submission.grade,
       }
    })
  }
  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get student submission for an assignment' })
  @ApiResponse({ status: 200, description: 'Returns the student submission for the assignment', type:SubmissionResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden - Not authorized to view this submission' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  async getStudentSubmissionByAssignment(
    @Req() req,
    @Param('studentId') studentId: number,
    @Param('assignmentId') assignmentId: number,
  ) {
  
    return await this.submissionsService.getStudentSubmissionByAssignment(
      studentId,
      assignmentId,
    );
  }
  @Get(':submissionId')
  async getSubmissionById(
    @Req() req,
    @Param('submissionId') submissionId: number,
  ) {
    const userId = req.user.id;

    return await this.submissionsService.getSubmissionById(submissionId);
  }

   @ApiProduces('application/octet-stream')
      @ApiResponse({
        status: 200,
        description: 'File downloaded successfully',
        headers: {
          'Content-Disposition': {
            description: 'Attachment with filename',
            schema: {
              type: 'string',
              example: 'attachment; filename="assignment.pdf"'
            }
          }
        },
        content: {
          'application/octet-stream': {
            schema: {
              type: 'string',
              format: 'binary',
            }
          }
        }
      })
  @Get('files/:fileId')
  async downloadSubmissionFile(
    @Req() req,
    @Param('fileId') fileId: number,
    @Res() res: Response,
  ) {
    const userId = req.user.id;
    const file = await this.submissionsService.getSubmissionFile(
      userId,
      fileId,
    );
    
    res.sendFile(file.filePath, { root: './' }, (err) => {
      if (err) {
        res.status(500).send('Error downloading file.');
      }
    });
  }

  // Professors grade submissions
  @Roles(Role.Professor)
  @ApiBody({ type: GradeSubmissionDto })
  @Post(':submissionId/grade')
  async gradeSubmission(
    @Req() req,
    @Param('submissionId') submissionId: number,
    @Body() body: GradeSubmissionDto,
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
