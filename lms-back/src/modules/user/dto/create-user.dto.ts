import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '@common/constants/roles.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: [Role.Admin],
    description: 'List of user roles',
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one role must be specified' })
  @ArrayUnique({ message: 'Roles must be unique' })
  @IsEnum(Role, { each: true, message: 'Each role must be a valid Role' })
  roles: Role[];
}
