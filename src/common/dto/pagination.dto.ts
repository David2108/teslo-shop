import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto{

    @ApiProperty({
        default: 10,
        description: 'How many rows do you need?',
        required: false
    })
    @IsOptional()
    @IsPositive()
    @Type(() => Number) // Transforma string a number
    limit?: number;

    @ApiProperty({
        default: 0,
        description: 'How many rows do you want to skip?',
        required: false
    })
    @IsOptional()
    @Min(0)
    @Type(() => Number)
    offset?: number;
}