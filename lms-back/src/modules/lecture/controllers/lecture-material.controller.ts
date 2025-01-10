// lecture-materials/lecture-materials.controller.ts
import {
  Controller,
  Post,
  Get,
  Delete,
  UseGuards,
  Req,
  Param,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { LectureMaterialsService } from '../services/lecture-material.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName } from '@common/utils/edit-file-name';
import { fileFilter } from '@common/filters/file-filter';
import { Response } from 'express';
import { RolesGuard } from '@common/guards/roles.guard';
import { Role } from '@common/constants/roles.enum';
import { Roles } from '@common/decorators/role.decorator';
import { ApiBody, ApiConsumes, ApiProduces, ApiResponse } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';
import { ensureDirectoryExists } from '@common/utils/directory-exists';
import { join } from 'path';
import { UPLOAD_DIR, MATERIALS_DIR } from '@common/constants/path';


@Controller('lectures/:lectureId/materials')
export class LectureMaterialsController {
  constructor(
    private readonly lectureMaterialsService: LectureMaterialsService,
  ) {}

  @UseGuards(RolesGuard)
  @Roles(Role.Professor)
  @Post('upload')
  @ApiConsumes('multipart/form-data') // Specifies the content type for file upload
  @ApiBody({
    description: 'Upload a lecture material file (PDF, DOC, DOCX, XLS, XLSX)',
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
  @Post('upload/:lectureId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(process.cwd(), UPLOAD_DIR, MATERIALS_DIR);
          ensureDirectoryExists(uploadPath);
          cb(null, uploadPath);
        },
        filename: editFileName,
      }),
      fileFilter: fileFilter,
      limits: { fileSize: 50 * 1024 * 1024 }, 
    }),
  )
  async uploadMaterial(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
    @Param('lectureId') lectureId: number,
  ) {
    const professorId = req.user.id;
    
    // Update the filePath to use forward slashes
    file.path = file.path.replace(/\\/g, '/');
    
    return await this.lectureMaterialsService.uploadMaterial(
      professorId,
      lectureId,
      file,
    );
  }
  
  @Roles(Role.Admin, Role.Student, Role.Professor)
  @Get()
  async getMaterialsByLecture(
    @Req() req,
    @Param('lectureId') lectureId: number,
  ) {
    const userId = req.user.id;
    return await this.lectureMaterialsService.getMaterialsByLecture(
      userId,
      lectureId,
    );
  }

 // lecture-materials.controller.ts
@Get(':materialId/download')
@ApiProduces('application/octet-stream')
@ApiResponse({
  status: 200,
  description: 'File downloaded successfully',
  headers: {
    'Content-Disposition': {
      description: 'Attachment with filename',
      schema: {
        type: 'string',
        example: 'attachment; filename="document.pdf"'
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
async downloadMaterial(
  @Req() req,
  @Param('materialId') materialId: number,
  @Res() res: Response,
) {
  const userId = req.user.id;
  const material = await this.lectureMaterialsService.getMaterialById(
    userId,
    materialId,
  );

  // Use path.join to create absolute path


  // Set the Content-Disposition header
  res.setHeader(
    'content-disposition',
    `attachment; filename="${encodeURIComponent(material.originalName)}"`
  );

  // Send the file with absolute path
  res.sendFile(material.filePath, (err) => {
    if (err) {
      console.error('File download error:', err);
      res.status(500).send('Error downloading file.');
    }
  });
}
  @Roles(Role.Professor)
  @Delete(':materialId')
  async deleteMaterial(@Req() req, @Param('materialId') materialId: number) {
    const professorId = req.user.id;
    await this.lectureMaterialsService.deleteMaterial(professorId, materialId);
    return { message: 'Material deleted successfully.' };
  }
}
