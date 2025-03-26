import { ApiProperty } from "@nestjs/swagger";

export class GPTFeedbackDto {
    @ApiProperty()
    score: number;
    @ApiProperty()

    feedback: string;
    @ApiProperty()

    matchedRequirements: string[];
    @ApiProperty()

    missingRequirements: string[];
    @ApiProperty()

    suggestions: string[];
  }