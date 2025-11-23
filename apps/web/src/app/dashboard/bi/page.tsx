'use client';

import { Activity, AlertTriangle, Clock, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CostAnalysisCard } from '@/components/bi/cost-analysis-card';
import { BottleneckChart } from '@/components/bi/bottleneck-chart';
import { StockForecastTable } from '@/components/bi/stock-forecast-table';

export default function BIDashboardPage() {
    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">İş Zekası</h1>
                    <p className="text-muted-foreground">
                        Üretim, stok ve maliyet yönetimi için yapay zeka destekli içgörüler.
                    </p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Aktif Sipariş</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">15</div>
                        <p className="text-xs text-muted-foreground">
                            Düne göre +2 artış
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Kritik Stok Uyarıları</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">3</div>
                        <p className="text-xs text-muted-foreground">
                            Min. seviye altındaki ürünler
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ort. Üretim Süresi</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4.2 Gün</div>
                        <p className="text-xs text-muted-foreground">
                            Geçen aya göre -0.5 gün
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Aylık Ciro</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₺245.000</div>
                        <p className="text-xs text-muted-foreground">
                            Geçen aya göre +%12
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content - Vertical Stack for Maximum Readability */}
            <div className="space-y-6">
                {/* Production Bottlenecks */}
                <BottleneckChart />

                {/* Stock Forecast & Cost Analysis */}
                <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
                    <StockForecastTable />
                    <CostAnalysisCard />
                </div>
            </div>
        </div>
    );
}
