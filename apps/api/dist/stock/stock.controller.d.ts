import { StockService } from './stock.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
export declare class StockController {
    private readonly stockService;
    constructor(stockService: StockService);
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
    getPriceHistory(id: string): Promise<{
        id: string;
        materialId: string;
        currency: string;
        price: number;
        changedAt: Date;
    }[]>;
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
}
