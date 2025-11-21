import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateShipmentDto {
    @IsNotEmpty()
    @IsString()
    orderId: string;

    @IsNotEmpty()
    @IsString()
    waybillNumber: string; // İrsaliye No

    @IsOptional()
    @IsString()
    carrierInfo?: string; // JSON string for carrier details
}
