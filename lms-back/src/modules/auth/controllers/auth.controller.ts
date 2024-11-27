import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { Public } from '@common/decorators/public.decorator';
import { LoginDto } from '../dto/login.dto';
import { TokenResponseDto } from '../dto/token-response.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @Public()
  @ApiOkResponse({ type: TokenResponseDto })
  async login(@Body() loginDto: LoginDto) {
    try {
      return this.authService.login(loginDto.email, loginDto.password);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: TokenResponseDto })
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    try {
      return this.authService.refresh(refreshTokenDto.refreshToken);
    } catch {
      throw new BadRequestException('Invalid refresh token');
    }
  }
}
