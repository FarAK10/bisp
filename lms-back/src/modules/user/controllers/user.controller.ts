import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  Request,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserService } from '../services/user.service';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUserDto } from '../dto/get-user.dto';
import { User } from '../entities/user.entity';
import { Public } from '@common/decorators/public.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserProfile } from '../services/user.profile';
import { TableResponseDto } from '@common/dto/table.dto';
import { ApiTableResponse } from '@common/decorators/table-response.decorator';
import { UserTableResponseDto } from '../dto/table-response.dot';
@ApiTags('users') // Adds a "users" tag in Swagger
@ApiBearerAuth('access-token') // Use the same name as in addBearerAuth()
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private userProfile: UserProfile,
  ) {}
  @ApiResponse({
    status: 200,
    type: GetUserDto,
  })
  @Public()
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.userService.create(createUserDto);
      return this.userProfile.mapUserToGetUserDto(user);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
  @Get()
  @ApiResponse({ type: UserTableResponseDto })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<TableResponseDto<GetUserDto>> {
    try {
      return this.userService.findAll(page, limit);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
  @ApiResponse({
    status: 200,
    type: GetUserDto,
  })
  @Get('getUserProfile')
  async getUserProfile(@Request() req): Promise<GetUserDto> {
    try {
      const user: User = req.user;
      return this.userProfile.mapUserToGetUserDto(user);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
  @ApiResponse({
    status: 200,
    type: GetUserDto,
  })
  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    try {
      const user = await this.userService.findOne(id);
      return this.userProfile.mapUserToGetUserDto(user);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
  @ApiResponse({
    status: 200,
    type: GetUserDto,
  })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      return this.userService.update(id, updateUserDto);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      return this.userService.remove(id);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
