import { Controller, Get, Param, Query } from '@nestjs/common';
import { BiService } from './bi.service';

@Controller('bi')
export class BiController {
    constructor(private readonly biService: BiService) { }

    @Get('cost-analysis/:productId')
    getCostAnalysis(
        @Param('productId') productId: string,
        @Query('date') date?: string,
    ) {
        return this.biService.getCostAnalysis(productId, date);
    }

    @Get('bottlenecks')
    getBottlenecks() {
        return this.biService.getProductionBottlenecks();
    }

    @Get('stock-forecast')
    getStockForecast() {
        return this.biService.getStockForecast();
    }
}
