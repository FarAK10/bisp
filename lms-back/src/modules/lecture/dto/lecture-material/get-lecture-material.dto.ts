import { ApiProperty } from '@nestjs/swagger';

export class GetLectureMaterialDto {
  @ApiProperty({ description: 'ID of the lecture material' })
  id: number;

  @ApiProperty({ description: 'Title of the material' })
  title: string;

  @ApiProperty({ description: 'Original name of the uploaded file' })
  originalName: string;

  @ApiProperty({ description: 'Filename on the server' })
  filename: string;

  @ApiProperty({ description: 'Path of the file' })
  filePath: string;

  @ApiProperty({ description: 'MIME type of the file' })
  mimetype: string;

  @ApiProperty({ description: 'Upload date of the file' })
  uploadedAt: Date;
}
