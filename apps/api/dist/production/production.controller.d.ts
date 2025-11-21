import { ProductionService } from './production.service';
import { CreateProductionDto } from './dto/create-production.dto';
import { UpdateProductionDto } from './dto/update-production.dto';
export declare class ProductionController {
    private readonly productionService;
    constructor(productionService: ProductionService);
    create(createProductionDto: CreateProductionDto): Promise<{
        id: string;
        orderId: string;
        currentStage: string;
        startedAt: Date;
        completedAt: Date | null;
    }>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
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
        currentStage: string;
        startedAt: Date;
        completedAt: Date | null;
    })[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__ProductionTrackingClient<({
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
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, updateProductionDto: UpdateProductionDto): string;
    updateStage(id: string, stage: string): Promise<{
        id: string;
        orderId: string;
        currentStage: string;
        startedAt: Date;
        completedAt: Date | null;
    }>;
    remove(id: string): string;
}
