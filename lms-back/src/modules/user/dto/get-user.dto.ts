import { CreateUserDto } from './create-user.dto';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { UpdateUserDto } from './update-user.dto';
export class GetUserDto extends OmitType(UpdateUserDto, ['password']) {}
