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
exports.ProductionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let ProductionService = class ProductionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createProductionDto) {
        const { orderId } = createProductionDto;
        const existing = await this.prisma.productionTracking.findUnique({
            where: { orderId },
        });
        if (existing) {
            return existing;
        }
        const production = await this.prisma.productionTracking.create({
            data: {
                orderId,
                currentStage: 'CUTTING_BENDING',
                history: {
                    create: {
                        stage: 'CUTTING_BENDING',
                        notes: 'Production started',
                    }
                }
            },
        });
        await this.prisma.order.update({
            where: { id: orderId },
            data: { status: 'IN_PRODUCTION' },
        });
        return production;
    }
    findAll() {
        return this.prisma.productionTracking.findMany({
            where: {
                order: {
                    status: {
                        notIn: ['SHIPPED', 'COMPLETED']
                    }
                }
            },
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
            }
        });
    }
    findOne(id) {
        return this.prisma.productionTracking.findUnique({
            where: { id },
            include: {
                history: true,
                order: {
                    include: {
                        items: {
                            include: {
                                product: true,
                            }
                        }
                    }
                }
            }
        });
    }
    update(id, updateProductionDto) {
        return `This action updates a #${id} production`;
    }
    remove(id) {
        return `This action removes a #${id} production`;
    }
    STAGES = [
        'CUTTING_BENDING',
        'WELDING_GRINDING',
        'PAINTING_WASHING',
        'ASSEMBLY_PACKAGING',
        'READY_FOR_SHIPMENT'
    ];
    async updateStage(id, stage) {
        if (!this.STAGES.includes(stage)) {
            throw new Error(`Invalid stage. Must be one of: ${this.STAGES.join(', ')}`);
        }
        const currentTracking = await this.prisma.productionTracking.findUnique({
            where: { id },
        });
        if (!currentTracking) {
            throw new Error('Production tracking not found');
        }
        const currentIndex = this.STAGES.indexOf(currentTracking.currentStage);
        const newIndex = this.STAGES.indexOf(stage);
        if (newIndex < currentIndex) {
            throw new Error('Cannot move production stage backwards');
        }
        const updatedTracking = await this.prisma.productionTracking.update({
            where: { id },
            data: {
                currentStage: stage,
                history: {
                    create: {
                        stage: stage,
                        notes: `Moved from ${currentTracking.currentStage} to ${stage}`,
                    }
                }
            },
        });
        if (stage === 'READY_FOR_SHIPMENT') {
            await this.prisma.order.update({
                where: { id: currentTracking.orderId },
                data: { status: 'READY_FOR_SHIPMENT' },
            });
        }
        return updatedTracking;
    }
};
exports.ProductionService = ProductionService;
exports.ProductionService = ProductionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductionService);
//# sourceMappingURL=production.service.js.map