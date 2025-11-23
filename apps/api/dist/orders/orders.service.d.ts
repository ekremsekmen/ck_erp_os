import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';
import { PdfService } from '../common/pdf.service';
export declare class OrdersService {
    private prisma;
    private pdfService;
    constructor(prisma: PrismaService, pdfService: PdfService);
    create(createOrderDto: CreateOrderDto): Promise<{
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
    }>;
    private calculateOrderTotal;
    findAll(): Prisma.PrismaPromise<({
        shipment: {
            id: string;
            orderId: string;
            waybillNumber: string;
            carrierInfo: string | null;
            shippedAt: Date;
        } | null;
        items: {
            id: string;
            orderId: string;
            productId: string;
            quantity: number;
            configuration: string | null;
            unitPrice: number;
        }[];
        production: {
            id: string;
            orderId: string;
            currentStage: string;
            startedAt: Date;
            completedAt: Date | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerName: string;
        customerInfo: string | null;
        status: string;
        totalAmount: number;
        customerId: string | null;
    })[]>;
    findOne(id: string): Prisma.Prisma__OrderClient<({
        shipment: {
            id: string;
            orderId: string;
            waybillNumber: string;
            carrierInfo: string | null;
            shippedAt: Date;
        } | null;
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
        production: ({
            history: {
                id: string;
                completedAt: Date | null;
                stage: string;
                enteredAt: Date;
                notes: string | null;
                trackingId: string;
            }[];
        } & {
            id: string;
            orderId: string;
            currentStage: string;
            startedAt: Date;
            completedAt: Date | null;
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerName: string;
        customerInfo: string | null;
        status: string;
        totalAmount: number;
        customerId: string | null;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, updateOrderDto: UpdateOrderDto): Prisma.Prisma__OrderClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerName: string;
        customerInfo: string | null;
        status: string;
        totalAmount: number;
        customerId: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): Prisma.Prisma__OrderClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerName: string;
        customerInfo: string | null;
        status: string;
        totalAmount: number;
        customerId: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    startProduction(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerName: string;
        customerInfo: string | null;
        status: string;
        totalAmount: number;
        customerId: string | null;
    }>;
    private deductStock;
    updateStatus(id: string, status: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerName: string;
        customerInfo: string | null;
        status: string;
        totalAmount: number;
        customerId: string | null;
    }>;
    getProformaPdf(id: string): Promise<Buffer>;
}
