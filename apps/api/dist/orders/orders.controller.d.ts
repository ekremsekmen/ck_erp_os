import { Response } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
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
    }>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        shipment: {
            id: string;
            orderId: string;
            waybillNumber: string;
            shippedAt: Date;
            carrierInfo: string | null;
        } | null;
        items: {
            id: string;
            orderId: string;
            productId: string;
            quantity: number;
            unitPrice: number;
            configuration: string | null;
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
    findOne(id: string): import(".prisma/client").Prisma.Prisma__OrderClient<({
        shipment: {
            id: string;
            orderId: string;
            waybillNumber: string;
            shippedAt: Date;
            carrierInfo: string | null;
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
            unitPrice: number;
            configuration: string | null;
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
    update(id: string, updateOrderDto: UpdateOrderDto): import(".prisma/client").Prisma.Prisma__OrderClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerName: string;
        customerInfo: string | null;
        status: string;
        totalAmount: number;
        customerId: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__OrderClient<{
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
    getProformaPdf(id: string, res: Response): Promise<void>;
}
