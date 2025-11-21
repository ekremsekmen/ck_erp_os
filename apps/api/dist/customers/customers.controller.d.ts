import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    create(createCustomerDto: CreateCustomerDto): import(".prisma/client").Prisma.Prisma__CustomerClient<{
        email: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        address: string | null;
        taxId: string | null;
        taxOffice: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        email: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        address: string | null;
        taxId: string | null;
        taxOffice: string | null;
    }[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__CustomerClient<({
        orders: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerName: string;
            customerInfo: string | null;
            status: string;
            totalAmount: number;
            customerId: string | null;
        }[];
    } & {
        email: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        address: string | null;
        taxId: string | null;
        taxOffice: string | null;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, updateCustomerDto: UpdateCustomerDto): import(".prisma/client").Prisma.Prisma__CustomerClient<{
        email: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        address: string | null;
        taxId: string | null;
        taxOffice: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__CustomerClient<{
        email: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        address: string | null;
        taxId: string | null;
        taxOffice: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    getOrders(id: string): import(".prisma/client").Prisma.PrismaPromise<({
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
}
