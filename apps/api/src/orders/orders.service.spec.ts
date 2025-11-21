import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma.service';

describe('OrdersService', () => {
    let service: OrdersService;
    let prismaService: PrismaService;

    const mockPrismaService: any = {
        product: {
            findUnique: jest.fn(),
        },
        order: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        productionTracking: {
            create: jest.fn(),
        },
    };
    mockPrismaService.$transaction = jest.fn((callback) => callback(mockPrismaService));

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrdersService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<OrdersService>(OrdersService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create an order with calculated total amount', async () => {
            const createOrderDto = {
                customerInfo: { name: 'Test Customer' },
                customerId: 'cust-1',
                items: [
                    { productId: 'prod-1', quantity: 2, configuration: {} },
                ],
                status: 'PENDING',
            };

            const mockProduct = { id: 'prod-1', basePrice: 100 };
            mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
            mockPrismaService.order.create.mockResolvedValue({ id: 'order-1', ...createOrderDto, totalAmount: 200 });

            const result = await service.create(createOrderDto as any);

            expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({ where: { id: 'prod-1' } });
            expect(mockPrismaService.order.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    totalAmount: 200,
                    items: {
                        create: expect.arrayContaining([
                            expect.objectContaining({
                                productId: 'prod-1',
                                quantity: 2,
                                unitPrice: 100,
                            }),
                        ]),
                    },
                }),
            }));
            expect(result).toEqual(expect.objectContaining({ id: 'order-1', totalAmount: 200 }));
        });
    });
});
