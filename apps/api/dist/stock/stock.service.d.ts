import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { PrismaService } from '../prisma.service';
export declare class StockService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createStockDto: CreateStockDto): import(".prisma/client").Prisma.Prisma__MaterialClient<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        unitPrice: number;
        unit: string;
        currentStock: number;
        minStockLevel: number;
        currency: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        unitPrice: number;
        unit: string;
        currentStock: number;
        minStockLevel: number;
        currency: string;
    }[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__MaterialClient<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        unitPrice: number;
        unit: string;
        currentStock: number;
        minStockLevel: number;
        currency: string;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, updateStockDto: UpdateStockDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        unitPrice: number;
        unit: string;
        currentStock: number;
        minStockLevel: number;
        currency: string;
    }>;
    getPriceHistory(id: string): Promise<{
        id: string;
        materialId: string;
        currency: string;
        price: number;
        changedAt: Date;
    }[]>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__MaterialClient<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        unitPrice: number;
        unit: string;
        currentStock: number;
        minStockLevel: number;
        currency: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateStockLevel(id: string, quantity: number): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        unitPrice: number;
        unit: string;
        currentStock: number;
        minStockLevel: number;
        currency: string;
    }>;
}
