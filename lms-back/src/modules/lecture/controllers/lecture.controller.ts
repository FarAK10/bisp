// lectures/lectures.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LectureService } from '../services/lecture.service';
import { RolesGuard } from '@common/guards/roles.guard';
import { Role } from '@common/constants/roles.enum';
import { CreateLectureDto } from '../dto/lecture/create-lecture.dto';
import { UpdateLectureDto } from '../dto/lecture/update-lecture.dto';
import { Roles } from '@common/decorators/role.decorator';

@Controller('courses/:courseId/lectures')
@UseGuards(RolesGuard)
export class LecturesController {
  constructor(private readonly lecturesService: LectureService) {}

  @Roles(Role.Professor, Role.Admin)
  @Post()
  async createLecture(
    @Req() req,
    @Param('courseId') courseId: number,
    @Body() createLectureDto: CreateLectureDto,
  ) {
    const professorId = req.user.id;
    return await this.lecturesService.createLecture(
      professorId,
      courseId,
      createLectureDto,
    );
  }
  @Roles(Role.Admin, Role.Student, Role.Professor)
  @Get()
  async getLecturesByCourse(@Req() req, @Param('courseId') courseId: number) {
    const userId = req.user.id;
    return await this.lecturesService.getLecturesByCourse(userId, courseId);
  }

  @Roles(Role.Admin, Role.Student, Role.Professor)
  @Get(':lectureId')
  async getLectureById(@Req() req, @Param('lectureId') lectureId: number) {
    const userId = req.user.id;
    return await this.lecturesService.getLectureById(userId, lectureId);
  }

  @Roles(Role.Admin, Role.Student, Role.Professor)
  @Put(':lectureId')
  async updateLecture(
    @Req() req,
    @Param('lectureId') lectureId: number,
    @Body() updateLectureDto: UpdateLectureDto,
  ) {
    const professorId = req.user.id;
    return await this.lecturesService.updateLecture(
      professorId,
      lectureId,
      updateLectureDto,
    );
  }

  @Roles(Role.Admin, Role.Professor)
  @Delete(':lectureId')
  async deleteLecture(@Req() req, @Param('lectureId') lectureId: number) {
    const professorId = req.user.id;
    await this.lecturesService.deleteLecture(professorId, lectureId);
    return { message: 'Lecture deleted successfully.' };
  }
}
