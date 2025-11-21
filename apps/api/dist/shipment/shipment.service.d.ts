import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { PrismaService } from '../prisma.service';
import { PdfService } from '../common/pdf.service';
export declare class ShipmentService {
    private prisma;
    private pdfService;
    constructor(prisma: PrismaService, pdfService: PdfService);
    create(createShipmentDto: CreateShipmentDto): Promise<{
        id: string;
        orderId: string;
        waybillNumber: string;
        shippedAt: Date;
        carrierInfo: string | null;
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
        shippedAt: Date;
        carrierInfo: string | null;
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
                unitPrice: number;
                configuration: string | null;
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
        shippedAt: Date;
        carrierInfo: string | null;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, updateShipmentDto: UpdateShipmentDto): import(".prisma/client").Prisma.Prisma__ShipmentClient<{
        id: string;
        orderId: string;
        waybillNumber: string;
        shippedAt: Date;
        carrierInfo: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__ShipmentClient<{
        id: string;
        orderId: string;
        waybillNumber: string;
        shippedAt: Date;
        carrierInfo: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    getWaybillPdf(id: string): Promise<Buffer>;
}
