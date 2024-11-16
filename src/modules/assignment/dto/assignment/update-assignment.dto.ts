import { IsNotEmpty } from 'class-validator';
// assignments/dto/update-assignment.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateAssignmentDto } from './create-assignment.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAssignmentDto extends PartialType(CreateAssignmentDto) {}
