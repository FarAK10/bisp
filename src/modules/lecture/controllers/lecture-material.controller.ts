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
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';

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
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: '/uploads/lecture-materials',
        filename: editFileName,
      }),
      fileFilter: fileFilter,
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    }),
  )
  async uploadMaterial(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
    @Param('lectureId') lectureId: number,
  ) {
    const professorId = req.user.id;

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

  @Get(':materialId/download')
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
    res.sendFile(material.filePath, { root: './' }, (err) => {
      if (err) {
        res.status(500).send('Error downloading file.');
      }
    });
  }

  @UseGuards(RolesGuard)
  @Roles(Role.Professor)
  @Delete(':materialId')
  async deleteMaterial(@Req() req, @Param('materialId') materialId: number) {
    const professorId = req.user.id;
    await this.lectureMaterialsService.deleteMaterial(professorId, materialId);
    return { message: 'Material deleted successfully.' };
  }
}
