import { ApiProperty } from "@nestjs/swagger";

export class SelectItemDto {
    @ApiProperty()
    labe:string
    @ApiProperty()
    value:number;
}