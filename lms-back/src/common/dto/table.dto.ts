import { ApiProperty } from '@nestjs/swagger';

export class TableResponseDto<T> {
  @ApiProperty({ isArray: true })
  data: T[];
  @ApiProperty()
  count: number;
  @ApiProperty()
  page: number;
  @ApiProperty()
  limit: number;
}
