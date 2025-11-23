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
exports.BiService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let BiService = class BiService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCostAnalysis(productId, date) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            include: {
                recipe: {
                    include: {
                        material: {
                            include: {
                                priceHistory: {
                                    orderBy: { changedAt: 'desc' },
                                    take: 50,
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!product) {
            throw new Error('Product not found');
        }
        let currentCost = 0;
        const materialCosts = [];
        const targetDate = date ? new Date(date) : new Date();
        for (const item of product.recipe) {
            let unitPrice = item.material.unitPrice;
            if (date) {
                const historicalPrice = item.material.priceHistory.find(ph => ph.changedAt <= targetDate);
                if (historicalPrice) {
                    unitPrice = historicalPrice.price;
                }
            }
            const cost = item.quantity * unitPrice;
            currentCost += cost;
            materialCosts.push({
                materialName: item.material.name,
                quantity: item.quantity,
                unitPrice: unitPrice,
                totalCost: cost,
                priceHistory: item.material.priceHistory,
                isHistorical: !!date,
            });
        }
        return {
            productId: product.id,
            productName: product.name,
            currentTotalCost: currentCost,
            materialCosts,
            analysisDate: targetDate.toISOString(),
        };
    }
    FALLBACK_DURATIONS = {
        'CUTTING_BENDING': 4,
        'WELDING_GRINDING': 6,
        'PAINTING_WASHING': 12,
        'ASSEMBLY_PACKAGING': 4,
    };
    async getProductionBottlenecks() {
        const trackings = await this.prisma.productionTracking.findMany({
            where: {
                completedAt: { not: null },
            },
            include: {
                history: true,
            },
            take: 100,
            orderBy: { startedAt: 'desc' },
        });
        const stageDurations = {};
        for (const tracking of trackings) {
            for (const history of tracking.history) {
                if (history.completedAt) {
                    const duration = history.completedAt.getTime() - history.enteredAt.getTime();
                    const durationHours = duration / (1000 * 60 * 60);
                    if (!stageDurations[history.stage]) {
                        stageDurations[history.stage] = [];
                    }
                    stageDurations[history.stage].push(durationHours);
                }
            }
        }
        const allStages = Object.keys(this.FALLBACK_DURATIONS);
        const analysis = allStages.map(stage => {
            const durations = stageDurations[stage] || [];
            const sampleSize = durations.length;
            let averageDurationHours = 0;
            let maxDurationHours = 0;
            let minDurationHours = 0;
            if (sampleSize < 5) {
                averageDurationHours = this.FALLBACK_DURATIONS[stage];
                if (sampleSize > 0) {
                    const realAvg = durations.reduce((a, b) => a + b, 0) / sampleSize;
                }
            }
            else {
                averageDurationHours = durations.reduce((a, b) => a + b, 0) / sampleSize;
                maxDurationHours = Math.max(...durations);
                minDurationHours = Math.min(...durations);
            }
            return {
                stage,
                averageDurationHours: parseFloat(averageDurationHours.toFixed(2)),
                maxDurationHours: parseFloat(maxDurationHours.toFixed(2)),
                minDurationHours: parseFloat(minDurationHours.toFixed(2)),
                sampleSize,
                isFallback: sampleSize < 5
            };
        });
        const activeTrackings = await this.prisma.productionTracking.findMany({
            where: { completedAt: null },
            include: { history: true },
        });
        const potentialDelays = [];
        for (const tracking of activeTrackings) {
            const currentStage = tracking.currentStage;
            const currentHistory = tracking.history.find(h => h.stage === currentStage && !h.completedAt);
            if (currentHistory) {
                const elapsedHours = (new Date().getTime() - currentHistory.enteredAt.getTime()) / (1000 * 60 * 60);
                const stageStats = analysis.find(a => a.stage === currentStage);
                if (stageStats && elapsedHours > stageStats.averageDurationHours * 1.2) {
                    potentialDelays.push({
                        orderId: tracking.orderId,
                        stage: currentStage,
                        elapsedHours: parseFloat(elapsedHours.toFixed(2)),
                        averageExpected: stageStats.averageDurationHours,
                        delayRisk: 'HIGH',
                    });
                }
            }
        }
        return {
            stageBenchmarks: analysis,
            activeDelays: potentialDelays,
        };
    }
    async getStockForecast() {
        const pendingOrders = await this.prisma.order.findMany({
            where: { status: 'PENDING' },
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
        const requiredMaterials = {};
        for (const order of pendingOrders) {
            for (const item of order.items) {
                if (item.product && item.product.recipe) {
                    for (const recipeItem of item.product.recipe) {
                        const totalNeeded = recipeItem.quantity * item.quantity;
                        requiredMaterials[recipeItem.materialId] = (requiredMaterials[recipeItem.materialId] || 0) + totalNeeded;
                    }
                }
            }
        }
        const forecast = [];
        const materialIds = Object.keys(requiredMaterials);
        if (materialIds.length === 0) {
            return { forecast: [] };
        }
        const materials = await this.prisma.material.findMany({
            where: { id: { in: materialIds } },
        });
        for (const material of materials) {
            const needed = requiredMaterials[material.id];
            const projectedStock = material.currentStock - needed;
            const isCritical = projectedStock < material.minStockLevel;
            forecast.push({
                materialId: material.id,
                materialName: material.name,
                currentStock: material.currentStock,
                reservedForPending: needed,
                projectedStock: projectedStock,
                minStockLevel: material.minStockLevel,
                status: isCritical ? 'CRITICAL_SHORTAGE' : (projectedStock < 0 ? 'OUT_OF_STOCK' : 'OK'),
            });
        }
        return {
            pendingOrdersCount: pendingOrders.length,
            forecast: forecast.filter(f => f.status !== 'OK'),
        };
    }
};
exports.BiService = BiService;
exports.BiService = BiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BiService);
//# sourceMappingURL=bi.service.js.map