import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AssignmentFileResponseDto {
    @ApiProperty({
      example: 1,
      description: 'The unique identifier of the file'
    })
    id: number;
  
    @ApiProperty({
      example: 'project_template.pdf',
      description: 'Original name of the uploaded file'
    })
    originalFileName: string;
  
    @ApiProperty({
      example: 'pdf',
      description: 'Type of the file'
    })
    fileType: string;
  
    @ApiProperty({
      example: '2024-01-11T10:30:00Z',
      description: 'When the file was uploaded'
    })
    uploadedAt: Date;

    
  }

 export class AssignmentResponseDto {
    @ApiProperty({
      example: 1,
      description: 'The unique identifier of the assignment'
    })
    id: number;
  
    @ApiProperty({
      example: 'Project Milestone 1',
      description: 'Title of the assignment'
    })
    title: string;
  
    @ApiPropertyOptional({
      example: 'Submit your initial project design documents',
      description: 'Detailed description of the assignment'
    })
    description?: string;
  
    @ApiProperty({
      example: '2024-02-01T23:59:59Z',
      description: 'Due date for the assignment'
    })
    dueDate: Date;
  
    @ApiProperty({
        type: [AssignmentFileResponseDto],
        description: 'Files attached to this assignment'
      })
      files: AssignmentFileResponseDto[];
   
    @ApiProperty({
      example: '2024-01-11T10:30:00Z',
      description: 'When the assignment was created'
    })
    createdAt: Date;
  
    @ApiProperty({
      example: '2024-01-11T10:30:00Z',
      description: 'When the assignment was last updated'
    })
    updatedAt: Date;
  }
  