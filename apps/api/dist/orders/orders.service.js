"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const pdf_service_1 = require("../common/pdf.service");
let OrdersService = class OrdersService {
    prisma;
    pdfService;
    constructor(prisma, pdfService) {
        this.prisma = prisma;
        this.pdfService = pdfService;
    }
    async create(createOrderDto) {
        const { items, customerInfo, customerId, ...orderData } = createOrderDto;
        const { totalAmount, orderItemsData } = await this.calculateOrderTotal(items);
        return this.prisma.order.create({
            data: {
                ...orderData,
                customerInfo: typeof customerInfo === 'object' ? JSON.stringify(customerInfo) : customerInfo,
                customerId,
                totalAmount,
                items: {
                    create: orderItemsData,
                },
            },
            include: {
                items: {
                    include: {
                        product: true,
                    }
                },
            },
        });
    }
    async calculateOrderTotal(items) {
        let totalAmount = 0;
        const orderItemsData = [];
        if (items) {
            for (const item of items) {
                const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
                if (product) {
                    const itemTotal = product.basePrice * item.quantity;
                    totalAmount += itemTotal;
                    orderItemsData.push({
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: product.basePrice,
                        configuration: typeof item.configuration === 'object' ? JSON.stringify(item.configuration) : item.configuration,
                    });
                }
            }
        }
        return { totalAmount, orderItemsData };
    }
    findAll() {
        return this.prisma.order.findMany({
            include: {
                items: true,
                production: true,
                shipment: true,
            },
        });
    }
    findOne(id) {
        return this.prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: true,
                    }
                },
                production: {
                    include: {
                        history: true,
                    }
                },
                shipment: true,
            },
        });
    }
    update(id, updateOrderDto) {
        return this.prisma.order.update({
            where: { id },
            data: updateOrderDto,
        });
    }
    remove(id) {
        return this.prisma.order.delete({ where: { id } });
    }
    async startProduction(id) {
        const order = await this.prisma.order.findUnique({ where: { id } });
        if (!order)
            throw new Error('Order not found');
        if (order.status !== 'PENDING')
            throw new Error('Order must be PENDING to start production');
        return this.prisma.$transaction(async (prisma) => {
            const updatedOrder = await prisma.order.update({
                where: { id },
                data: { status: 'IN_PRODUCTION' },
            });
            await this.deductStock(id, prisma);
            await prisma.productionTracking.create({
                data: {
                    orderId: id,
                    currentStage: 'CUTTING_BENDING',
                    startedAt: new Date(),
                    history: {
                        create: {
                            stage: 'CUTTING_BENDING',
                            enteredAt: new Date(),
                            notes: 'Production started',
                        },
                    },
                },
            });
            return updatedOrder;
        });
    }
    async deductStock(orderId, prisma) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                recipe: true,
                            },
                        },
                    },
                },
            },
        });
        if (!order)
            return;
        for (const item of order.items) {
            if (item.product && item.product.recipe) {
                for (const recipeItem of item.product.recipe) {
                    const quantityToDeduct = recipeItem.quantity * item.quantity;
                    await prisma.material.update({
                        where: { id: recipeItem.materialId },
                        data: {
                            currentStock: {
                                decrement: quantityToDeduct,
                            },
                        },
                    });
                }
            }
        }
    }
    async updateStatus(id, status) {
        return this.prisma.order.update({
            where: { id },
            data: { status },
        });
    }
    async getProformaPdf(id) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                customer: true,
            },
        });
        if (!order) {
            throw new Error('Order not found');
        }
        return this.pdfService.generateProforma(order);
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, pdf_service_1.PdfService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map