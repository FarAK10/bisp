import { CreateUserDto } from './create-user.dto';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class UpdateUserDto extends OmitType(CreateUserDto,['password']) {
  @ApiProperty()
  @IsNotEmpty()
  id: number;
}
