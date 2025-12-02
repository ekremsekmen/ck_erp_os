import { BiService } from './bi.service';
export declare class BiController {
    private readonly biService;
    constructor(biService: BiService);
    getCostAnalysis(productId: string, date?: string): Promise<{
        productId: string;
        productName: string;
        currentTotalCost: number;
        materialCosts: {
            materialName: string;
            quantity: number;
            unitPrice: number;
            totalCost: number;
            priceHistory: {
                id: string;
                materialId: string;
                currency: string;
                price: number;
                changedAt: Date;
            }[];
            isHistorical: boolean;
        }[];
        analysisDate: string;
    }>;
    getBottlenecks(): Promise<{
        stageBenchmarks: {
            stage: string;
            averageDurationHours: number;
            maxDurationHours: number;
            minDurationHours: number;
            sampleSize: number;
            isFallback: boolean;
        }[];
        activeDelays: {
            orderId: string;
            stage: string;
            elapsedHours: number;
            averageExpected: number;
            delayRisk: string;
        }[];
    }>;
    getStockForecast(): Promise<{
        forecast: never[];
        pendingOrdersCount?: undefined;
    } | {
        pendingOrdersCount: number;
        forecast: {
            materialId: string;
            materialName: string;
            currentStock: number;
            reservedForPending: number;
            projectedStock: number;
            minStockLevel: number;
            status: string;
        }[];
    }>;
}
