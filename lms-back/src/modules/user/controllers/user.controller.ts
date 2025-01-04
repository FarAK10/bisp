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
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserService } from '../services/user.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUserDto } from '../dto/get-user.dto';
import { User } from '../entities/user.entity';
import { Public } from '@common/decorators/public.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiTags('users') // Adds a "users" tag in Swagger
@ApiBearerAuth('access-token') // Use the same name as in addBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Public()
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      return this.userService.create(createUserDto);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
  @Get()
  async getAllUsers() {
    try {
      return this.userService.findAll();
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
      return this.userService.findOne(id);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
  @ApiResponse({
    status: 200,
    type: GetUserDto,
  })
  @Get('getUserProfile')
  async getUserProfile(@Request() req) {
    try {
      const user: User = req.user;
      const userDTO: GetUserDto = {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
      };
      return userDTO;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

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
