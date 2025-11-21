import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto): import(".prisma/client").Prisma.Prisma__ProductClient<{
        recipe: ({
            material: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                unitPrice: number;
                unit: string;
                currentStock: number;
                minStockLevel: number;
                currency: string;
            };
        } & {
            id: string;
            productId: string;
            quantity: number;
            materialId: string;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        basePrice: number;
        description: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        recipe: ({
            material: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                unitPrice: number;
                unit: string;
                currentStock: number;
                minStockLevel: number;
                currency: string;
            };
        } & {
            id: string;
            productId: string;
            quantity: number;
            materialId: string;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        basePrice: number;
        description: string | null;
    })[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__ProductClient<({
        recipe: ({
            material: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                unitPrice: number;
                unit: string;
                currentStock: number;
                minStockLevel: number;
                currency: string;
            };
        } & {
            id: string;
            productId: string;
            quantity: number;
            materialId: string;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        basePrice: number;
        description: string | null;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, updateProductDto: UpdateProductDto): import(".prisma/client").Prisma.Prisma__ProductClient<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        basePrice: number;
        description: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__ProductClient<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        basePrice: number;
        description: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
