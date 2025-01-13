// assignments/controllers/assignment-files.controller.ts

import {
    Controller,
    Post,
    Get,
    UseGuards,
    Req,
    Param,
    Res,
    UploadedFile,
    UseInterceptors,
    ParseIntPipe,
    Delete,
    HttpCode,
    HttpStatus,
    NotFoundException,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { diskStorage } from 'multer';
  import { editFileName } from '@common/utils/edit-file-name';
  import { fileFilter } from '@common/filters/file-filter';
  import { Response } from 'express';
  import { RolesGuard } from '@common/guards/roles.guard';
  import { Role } from '@common/constants/roles.enum';
  import { Roles } from '@common/decorators/role.decorator';
  import { ApiBody, ApiConsumes, ApiProduces, ApiResponse } from '@nestjs/swagger';
  import { ensureDirectoryExists } from '@common/utils/directory-exists';
  import { join } from 'path';
  import { ASSIGNMENTS_DIR, UPLOAD_DIR,  } from '@common/constants/path';
import { AssignmentFilesService } from '../services/assignment-file.service';
import { existsSync } from 'fs';
  
  @Controller('assignments/:assignmentId/files')
  @UseGuards(RolesGuard)
  export class AssignmentFilesController {
    constructor(private readonly assignmentFilesService: AssignmentFilesService) {}
  
    @Roles(Role.Professor)
    @Post('upload')
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
      FileInterceptor('file', {
        storage: diskStorage({
          destination: (req, file, cb) => {
            const uploadPath = join(process.cwd(), UPLOAD_DIR, ASSIGNMENTS_DIR);
            ensureDirectoryExists(uploadPath);
            cb(null, uploadPath);
          },
          filename: editFileName,
        }),
        fileFilter: fileFilter,
        limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
      }),
    )
    async uploadAssignmentFile(
      @Req() req,
      @Param('assignmentId', ParseIntPipe) assignmentId: number,
      @UploadedFile() file: Express.Multer.File
    ) {
      const professorId = req.user.id;
      
      // Update the filePath to use forward slashes
      file.path = file.path.replace(/\\/g, '/');
      
      return await this.assignmentFilesService.uploadFile(
        professorId,
        assignmentId,
        file
      );
    }
  
    @Roles(Role.Professor, Role.Admin, Role.Student)
    @Roles(Role.Professor, Role.Admin, Role.Student)
    @Get(':fileId/download')
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
    @Get(':fileId/download')
   async downloadAssignmentFile(
    @Req() req,
    @Param('fileId', ParseIntPipe) fileId: number,
    @Res() res: Response,
) {
    try {
        const userId = req.user.id;
        const file = await this.assignmentFilesService.getFileById(userId, fileId);
      


        if (!existsSync(file.filePath)) {
            throw new NotFoundException('Physical file not found');
        }

        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${encodeURIComponent(file.originalFileName)}"`
        );

        res.setHeader('Content-Type', file.fileType);

        res.sendFile(file.filePath, (err) => {
            if (err) {
                console.error('File download error:', err);
                res.status(500).send('Error downloading file.');
            }
        });
    } catch (error) {
        if (error instanceof NotFoundException) {
            res.status(404).send(error.message);
        } else {
            console.error('Download error:', error);
            res.status(500).send('Error processing download request.');
        }
    }
}
    @Roles(Role.Professor)
    @Delete(':fileId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteFileById(
      @Req() req,
      @Param('fileId', ParseIntPipe) fileId: number,
    ) {
      const professorId = req.user.id;
      await this.assignmentFilesService.deleteFileById(professorId, fileId);
    }
  }