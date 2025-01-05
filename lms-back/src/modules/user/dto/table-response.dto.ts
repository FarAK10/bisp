import { TableResponseDto } from '@common/dto/table.dto';
import { GetUserDto } from './get-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UserTableResponseDto extends TableResponseDto<GetUserDto> {
  @ApiProperty({ type: GetUserDto, isArray: true })
  data: GetUserDto[];
}
