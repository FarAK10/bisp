import { Role } from '@common/constants/roles.enum';
import { Roles } from '@common/decorators/role.decorator';
import { RolesGuard } from '@common/guards/roles.guard';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { CourseService } from '../services/course.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('courses') // Adds a "users" tag in Swagger
@Controller('courses')
@UseGuards(RolesGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @Roles(Role.Professor)
  async create(@Body() createCourseDto: CreateCourseDto, @Request() req) {
    return this.courseService.create(createCourseDto, req.user.id);
  }

  @Get()
  @Roles(Role.Admin, Role.Professor, Role.Student)
  async findAll() {
    return this.courseService.findAll();
  }

  @Get(':id')
  @Roles(Role.Admin, Role.Professor, Role.Student)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.Professor, Role.Admin)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
    @Request() req,
  ) {
    return this.courseService.update(id, updateCourseDto, req.user);
  }

  @Delete(':id')
  @Roles(Role.Professor, Role.Admin)
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.courseService.remove(id, req.user);
  }

  @Post(':id/enroll')
  @Roles(Role.Student)
  async enroll(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.courseService.enrollStudent(id, req.user.id);
  }

  @Post(':id/unenroll')
  @Roles(Role.Student)
  async unenroll(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.courseService.unenrollStudent(id, req.user.id);
  }
}
