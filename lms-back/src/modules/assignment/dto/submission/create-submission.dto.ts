import { ApiProperty } from "@nestjs/swagger";
import {IsArray} from 'class-validator'
export class CreateSubmissionDto {
  @ApiProperty({ 
    type: 'array',
    items: {
      type: 'string',
      format: 'binary'
    },
    description: 'Array of files to submit for the assignment'
  })
  @IsArray()
  files: Array<Express.Multer.File>;
}
