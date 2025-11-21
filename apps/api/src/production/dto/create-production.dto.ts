import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProductionDto {
    @IsNotEmpty()
    @IsString()
    orderId: string;
}
