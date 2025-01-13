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
  Query,
} from '@nestjs/common';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { GetCourseDto } from '../dto/get-course.dto';
import { CourseService } from '../services/course.service';
import {
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiProperty,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CourseTableResponseDto } from '../dto/table-response.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ErrorResponse } from '@common/exceptions/base';
import { ProfessorCoursesFilterDto } from '../dto/professor-course-fitler.dto';
import { StudentCoursesFilterDto } from '../dto/student-course-filter.dto';
import { GetEnrolledCourseDto } from '../dto/get-enrolled-course.dto';
import { CourseWithLecturesResponseDto } from '../dto/course-with-lectures.dto';
import { ApiErroResponses } from '@common/decorators/common-issue-response';
@ApiBearerAuth('access-token') // Use the same name as in addBearerAuth()
@ApiTags('courses') // Adds a "users" tag in Swagger
@Controller('courses')
@UseGuards(RolesGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @Roles(Role.Admin)
  @ApiResponse({ status: 409, type: ErrorResponse })
  @ApiInternalServerErrorResponse({ type: ErrorResponse })
  async create(@Body() createCourseDto: CreateCourseDto, @Request() req) {
    return this.courseService.create(createCourseDto, req.user.id);
  }

  @ApiResponse({
    type: CourseTableResponseDto,
  })
  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.courseService.findAll(page, limit);
  }

  @Get('student-courses')
  @Roles(Role.Student)
  @ApiOperation({ summary: "Get student's enrolled courses" })
  @ApiResponse({ status: 200, type: [GetEnrolledCourseDto] })

  getStudentCourses(
    @Request() req,
    @Query() filters: StudentCoursesFilterDto,
  ) {
    return this.courseService.getStudentsCourses(req.user.id, filters);
  }

  @Get('professor-courses')
  @Roles(Role.Professor)
  @ApiOperation({ summary: "Get professor's courses" })
  @ApiResponse({ status: 200, type: [GetEnrolledCourseDto] })
  getProfessorCourses(
    @Request() req,
    @Query() filters: ProfessorCoursesFilterDto,
  ) {
    return this.courseService.getProffessorCourses(req.user.id, filters);
  }

  @ApiResponse({
    type:CourseWithLecturesResponseDto,
  })
  @Get('withLectures/:id')
  @Roles(Role.Admin,Role.Professor,Role.Student)
  async getCourseDetailsWithLecturesById(@Param('id', ParseIntPipe) courseId: number) {
    return this.courseService.getCourseWithLecturesById(courseId);
  }

  @ApiResponse({
    type: GetCourseDto,
  })
  @Get(':id')
  @Roles(Role.Admin, Role.Professor, Role.Student)
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.Professor, Role.Admin)
  @ApiResponse({ status: 409, type: ErrorResponse })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
    @Request() req,
  ) {
    return this.courseService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @Roles(Role.Professor, Role.Admin)
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.courseService.remove(id, req.user);
  }
  @ApiErroResponses()
  @ApiConflictResponse({type:ErrorResponse})
  @Post(':id/enroll')

  @Roles(Role.Student)
  async enroll(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.courseService.enrollStudent(id, req.user.id);
  }
  @ApiErroResponses()
  @Post(':id/unenroll')
  @Roles(Role.Student)
  async unenroll(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.courseService.unenrollStudentFromCourse(id, req.user.id);
  }
}
