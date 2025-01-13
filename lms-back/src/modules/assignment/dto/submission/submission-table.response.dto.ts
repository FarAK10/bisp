import { TableResponseDto } from "@common/dto/table.dto";
import { GetUserDto } from "@modules/user/dto/get-user.dto";
import { ApiProperty } from "@nestjs/swagger";
import { SubmissionResponseDto } from "./submission-response.dto";

export class SubmissionTableResponseDto extends TableResponseDto<SubmissionResponseDto> {
    @ApiProperty({type:SubmissionResponseDto,isArray:true})
    data: SubmissionResponseDto[]
}