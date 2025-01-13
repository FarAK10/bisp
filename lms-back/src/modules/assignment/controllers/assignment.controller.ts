// assignments/assignments.controller.ts
import { Roles } from '@common/decorators/role.decorator';
import { RolesGuard } from '@common/guards/roles.guard';
import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  UseGuards,
  Req,
  Param,
  Body,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { CreateAssignmentDto, UpdateAssignmentDto } from '../dto';
import { AssignmentsService } from '../services/assignment.service';
import { Role } from '@common/constants/roles.enum';
import { ApiResponse } from '@nestjs/swagger';
import { AssignmentResponseDto } from '../dto/assignment/get-assignment.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('courses/:courseId/assignments')
@UseGuards(RolesGuard)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}
  
  @Roles(Role.Professor)
  @Post()
  @ApiResponse({
    type:UpdateAssignmentDto
  })
  @UseInterceptors(FileInterceptor('files'))

  async createAssignment(
    @Req() req,
    @Param('courseId') courseId: number,
    @Body() createAssignmentDto: CreateAssignmentDto,
    @UploadedFiles() files: Array<Express.Multer.File>  ) {
    const professorId = req.user.id;
    return await this.assignmentsService.createAssignment(
      professorId,
      courseId,
      createAssignmentDto,
    );
  }

  @Get()
  @ApiResponse({
    type:AssignmentResponseDto,
    isArray:true
  })
  async getAssignmentsByCourse(
    @Req() req,
    @Param('courseId') courseId: number,
    
  ) {
    const userId = req.user.id;
    return await this.assignmentsService.getAssignmentsByCourse(
      userId,
      courseId,
    );
  }
   @ApiResponse({
     type:AssignmentResponseDto
   })
  @Roles(Role.Professor, Role.Admin, Role.Student)
  @Get(':assignmentId')
  async getAssignmentById(
    @Req() req,
    @Param('assignmentId') assignmentId: number,
  ) :Promise<AssignmentResponseDto>{
    const userId = req.user.id;
    const assignment =  await this.assignmentsService.getAssignmentById(assignmentId)
    return assignment;
  }

  @Roles(Role.Professor)
  @Put(':assignmentId')
  @ApiResponse({
    type:UpdateAssignmentDto
  })
  async updateAssignment(
    @Req() req,
    @Param('assignmentId') assignmentId: number,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
  ) {
    const professorId = req.user.id;
    return await this.assignmentsService.updateAssignment(
      professorId,
      assignmentId,
      updateAssignmentDto,
    );
  }

  @Roles(Role.Professor)
  @Delete(':assignmentId')
  
  async deleteAssignment(
    @Req() req,
    @Param('assignmentId') assignmentId: number,
  ) {
    const professorId = req.user.id;
    await this.assignmentsService.deleteAssignment(professorId, assignmentId);
    return { message: 'Assignment deleted successfully.' };
  }
}
