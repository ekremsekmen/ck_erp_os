import { Response } from 'express';
import { ShipmentService } from './shipment.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
export declare class ShipmentController {
    private readonly shipmentService;
    constructor(shipmentService: ShipmentService);
    create(createShipmentDto: CreateShipmentDto): Promise<{
        id: string;
        orderId: string;
        waybillNumber: string;
        carrierInfo: string | null;
        shippedAt: Date;
    }>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        order: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerName: string;
            customerInfo: string | null;
            status: string;
            totalAmount: number;
            customerId: string | null;
        };
    } & {
        id: string;
        orderId: string;
        waybillNumber: string;
        carrierInfo: string | null;
        shippedAt: Date;
    })[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__ShipmentClient<({
        order: {
            items: ({
                product: {
                    name: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    basePrice: number;
                    description: string | null;
                };
            } & {
                id: string;
                orderId: string;
                productId: string;
                quantity: number;
                configuration: string | null;
                unitPrice: number;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerName: string;
            customerInfo: string | null;
            status: string;
            totalAmount: number;
            customerId: string | null;
        };
    } & {
        id: string;
        orderId: string;
        waybillNumber: string;
        carrierInfo: string | null;
        shippedAt: Date;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, updateShipmentDto: UpdateShipmentDto): import(".prisma/client").Prisma.Prisma__ShipmentClient<{
        id: string;
        orderId: string;
        waybillNumber: string;
        carrierInfo: string | null;
        shippedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__ShipmentClient<{
        id: string;
        orderId: string;
        waybillNumber: string;
        carrierInfo: string | null;
        shippedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    getWaybillPdf(id: string, res: Response): Promise<void>;
}
