import { ApiProperty } from "@nestjs/swagger";
import { 
    IsArray, 
    IsIn, 
    IsInt, 
    IsNumber, 
    IsOptional, 
    IsPositive, 
    IsString, 
    MinLength 
} from "class-validator";

export class CreateProductDto {

    @ApiProperty({
        description: 'Product Title',
        nullable: false,
        minLength: 1
    })
    @IsString()
    @MinLength(1)
    title: string;

    @ApiProperty({
        description: 'Product Price',
        nullable: false,
        minimum: 0
    })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @ApiProperty({
        description: 'Product Description',
        nullable: true,
        default: null
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: 'Product Slug',
        nullable: true,
        default: null
    })
    @IsString()
    @IsOptional()
    slug?: string;


    @ApiProperty({
        description: 'Product Stock',
        nullable: true,
        default: 0
    })
    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number;

    @ApiProperty({
        description: 'Product Sizes',
        nullable: true,
        default: []
    })
    @IsString({each: true})
    @IsArray()
    sizes: string[];

    @ApiProperty({
        description: 'Product Gender',
        nullable: true,
        default: 'men'
    })
    @IsIn(['men', 'women', 'kid', 'unisex'])
    gender: string;

    @ApiProperty({
        description: 'Product Tags',
        nullable: true,
        default: []
    })
    @IsString({each: true})
    @IsArray()
    @IsOptional()
    tags: string[];

    @ApiProperty({
        description: 'Product Images',
        nullable: true,
        default: []
    })
    @IsString({each: true})
    @IsArray()
    @IsOptional()
    images: string[];
    
}