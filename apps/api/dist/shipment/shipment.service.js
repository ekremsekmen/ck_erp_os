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
exports.ShipmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const pdf_service_1 = require("../common/pdf.service");
let ShipmentService = class ShipmentService {
    prisma;
    pdfService;
    constructor(prisma, pdfService) {
        this.prisma = prisma;
        this.pdfService = pdfService;
    }
    async create(createShipmentDto) {
        const order = await this.prisma.order.findUnique({
            where: { id: createShipmentDto.orderId },
        });
        if (!order) {
            throw new Error('Order not found');
        }
        if (order.status !== 'READY_FOR_SHIPMENT') {
            throw new Error('Order is not ready for shipment');
        }
        const existingShipment = await this.prisma.shipment.findUnique({
            where: { orderId: createShipmentDto.orderId },
        });
        if (existingShipment) {
            return existingShipment;
        }
        await this.prisma.order.update({
            where: { id: createShipmentDto.orderId },
            data: { status: 'SHIPPED' },
        });
        return this.prisma.shipment.create({
            data: createShipmentDto,
        });
    }
    findAll() {
        return this.prisma.shipment.findMany({
            include: {
                order: true,
            },
        });
    }
    findOne(id) {
        return this.prisma.shipment.findUnique({
            where: { id },
            include: {
                order: {
                    include: {
                        items: {
                            include: {
                                product: true,
                            }
                        }
                    }
                }
            },
        });
    }
    update(id, updateShipmentDto) {
        return this.prisma.shipment.update({
            where: { id },
            data: updateShipmentDto,
        });
    }
    remove(id) {
        return this.prisma.shipment.delete({ where: { id } });
    }
    async getWaybillPdf(id) {
        const shipment = await this.prisma.shipment.findUnique({
            where: { id },
            include: {
                order: {
                    include: {
                        items: {
                            include: {
                                product: true,
                            },
                        },
                        customer: true,
                    },
                },
            },
        });
        if (!shipment) {
            throw new Error('Shipment not found');
        }
        return this.pdfService.generateWaybill(shipment);
    }
};
exports.ShipmentService = ShipmentService;
exports.ShipmentService = ShipmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, pdf_service_1.PdfService])
], ShipmentService);
//# sourceMappingURL=shipment.service.js.map