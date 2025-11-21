import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
    @IsNotEmpty()
    @IsString()
    productId: string;

    @IsNotEmpty()
    @IsNumber()
    quantity: number;

    @IsOptional()
    configuration?: any; // Can be object or JSON string
}

export class CreateOrderDto {
    @IsNotEmpty()
    @IsString()
    customerName: string;

    @IsOptional()
    customerInfo?: any; // Can be object or JSON string

    @IsOptional()
    @IsString()
    customerId?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items?: OrderItemDto[];
}
