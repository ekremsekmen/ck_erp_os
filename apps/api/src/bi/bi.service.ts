import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BiService {
    constructor(private prisma: PrismaService) { }

    async getCostAnalysis(productId: string, date?: string) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            include: {
                recipe: {
                    include: {
                        material: {
                            include: {
                                priceHistory: {
                                    orderBy: { changedAt: 'desc' },
                                    // We need more history to find the correct date match if needed
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
            // Determine price based on date
            let unitPrice = item.material.unitPrice;

            if (date) {
                // Find the price effective at the target date
                // Price history is ordered desc, so we look for the first one <= targetDate
                const historicalPrice = item.material.priceHistory.find(
                    ph => ph.changedAt <= targetDate
                );

                if (historicalPrice) {
                    unitPrice = historicalPrice.price;
                }
                // If no history found before date, fallback to current (or 0? current is safer)
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

    // Fallback durations in hours for cold start
    private readonly FALLBACK_DURATIONS = {
        'CUTTING_BENDING': 4,
        'WELDING_GRINDING': 6,
        'PAINTING_WASHING': 12,
        'ASSEMBLY_PACKAGING': 4,
    };

    async getProductionBottlenecks() {
        const trackings = await this.prisma.productionTracking.findMany({
            where: {
                completedAt: { not: null }, // Only analyze completed orders for baseline
            },
            include: {
                history: true,
            },
            take: 100, // Analyze last 100 completed orders
            orderBy: { startedAt: 'desc' },
        });

        const stageDurations: Record<string, number[]> = {};

        // Collect durations
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

        // Calculate stats with Cold Start logic
        const allStages = Object.keys(this.FALLBACK_DURATIONS);

        const analysis = allStages.map(stage => {
            const durations = stageDurations[stage] || [];
            const sampleSize = durations.length;

            let averageDurationHours = 0;
            let maxDurationHours = 0;
            let minDurationHours = 0;

            if (sampleSize < 5) {
                // Cold Start: Use fallback duration
                averageDurationHours = this.FALLBACK_DURATIONS[stage as keyof typeof this.FALLBACK_DURATIONS];
                // If we have some data, mix it? No, stick to fallback for stability or simple avg if > 0
                if (sampleSize > 0) {
                    const realAvg = durations.reduce((a, b) => a + b, 0) / sampleSize;
                    // Weighted average: 80% fallback, 20% real (simple smoothing)
                    // Or just use fallback if < 5 strictly. Let's use fallback strictly for safety as requested.
                }
            } else {
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

        // Check active orders for delays
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

                if (stageStats && elapsedHours > stageStats.averageDurationHours * 1.2) { // 20% buffer
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
        // 1. Get all PENDING orders
        // NOTE: We only check PENDING orders because IN_PRODUCTION orders have already 
        // triggered 'deductStock' in the 'startProduction' transaction.
        // Including IN_PRODUCTION would cause double counting of reserved stock.
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

        // 2. Calculate total required materials
        const requiredMaterials: Record<string, number> = {};

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

        // 3. Check against current stock
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
            forecast: forecast.filter(f => f.status !== 'OK'), // Only show issues
        };
    }
}
