import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateStockDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    unit: string; // kg, m2, piece, etc.

    @IsOptional()
    @IsNumber()
    currentStock?: number;

    @IsOptional()
    @IsNumber()
    minStockLevel?: number;

    @IsOptional()
    @IsNumber()
    unitPrice?: number;

    @IsOptional()
    @IsString()
    currency?: string;
}
