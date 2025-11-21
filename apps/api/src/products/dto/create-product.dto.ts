import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class RecipeItemDto {
    @IsNotEmpty()
    @IsString()
    materialId: string;

    @IsNotEmpty()
    @IsNumber()
    quantity: number;
}

export class CreateProductDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsNumber()
    basePrice: number;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RecipeItemDto)
    recipe?: RecipeItemDto[];
}
