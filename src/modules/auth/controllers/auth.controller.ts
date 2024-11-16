import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { Public } from '@common/decorators/public.decorator';
import { LoginDto } from '../dto/login';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @HttpCode(HttpStatus.OK)
  @Get('login')
  @Public()
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }
}
