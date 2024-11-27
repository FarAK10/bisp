import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GetUserDto } from '@modules/user/dto/get-user.dto';
export class GetCourseDto {
  @ApiProperty()
  title: string;
  @ApiProperty()
  description?: string;

  @ApiProperty()
  professor: GetUserDto;
}
