'use client';

import { useEffect, useState } from 'react';
import { fetchStockForecast, StockForecast } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export function StockForecastTable({ className }: { className?: string }) {
    const [data, setData] = useState<StockForecast | null>(null);

    useEffect(() => {
        fetchStockForecast().then(setData);
    }, []);

    if (!data) return <div className="h-full flex items-center justify-center text-muted-foreground">Yükleniyor...</div>;

    return (
        <Card className={`shadow-sm border-0 bg-white/50 backdrop-blur-sm ${className}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold">Stok Tahmini</CardTitle>
                    <p className="text-xs text-muted-foreground">
                        {data.pendingOrdersCount} bekleyen siparişe göre
                    </p>
                </div>
                <Badge variant="outline" className="bg-white text-xs">
                    {data.pendingOrdersCount} Bekleyen
                </Badge>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border bg-white overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableHead className="w-[30%] text-xs font-medium pl-4">Malzeme</TableHead>
                                <TableHead className="w-[15%] text-center text-xs font-medium">Durum</TableHead>
                                <TableHead className="w-[35%] text-xs font-medium">Stok Kullanımı</TableHead>
                                <TableHead className="w-[20%] text-right text-xs font-medium pr-4">Tahmini Kalan</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.forecast.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <div className="p-3 bg-green-50 rounded-full ring-4 ring-green-50/50">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-green-600"><path d="M20 6 9 17l-5-5" /></svg>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-foreground">Her Şey Yolunda</p>
                                                <p className="text-xs">Öngörülen bir stok sıkıntısı bulunmuyor.</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.forecast.map((item) => {
                                    // Calculate percentages for the visual bar
                                    const total = Math.max(item.currentStock, item.minStockLevel * 1.2); // Ensure bar has some headroom
                                    const reservedPercent = (item.reservedForPending / total) * 100;
                                    const remainingPercent = (item.projectedStock / total) * 100;
                                    const minStockPercent = (item.minStockLevel / total) * 100;

                                    return (
                                        <TableRow key={item.materialId} className="group hover:bg-muted/30 transition-colors">
                                            <TableCell className="py-3 pl-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors truncate" title={item.materialName}>
                                                        {item.materialName}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                        <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                                                        Min: {item.minStockLevel}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center py-3">
                                                <Badge
                                                    variant="secondary"
                                                    className={`text-[10px] font-medium px-2 py-0.5 border whitespace-nowrap ${item.status === 'OK'
                                                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                            : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                                        }`}
                                                >
                                                    {item.status === 'OK' ? 'YETERLİ' : 'KRİTİK'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <div className="space-y-1.5">
                                                    <div className="flex flex-wrap justify-between gap-2 text-[10px]">
                                                        <span className="text-muted-foreground whitespace-nowrap">
                                                            Rezerve: <span className="font-medium text-foreground">{item.reservedForPending}</span>
                                                        </span>
                                                        <span className="text-muted-foreground whitespace-nowrap">
                                                            Mevcut: <span className="font-medium text-foreground">{item.currentStock}</span>
                                                        </span>
                                                    </div>
                                                    <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden relative">
                                                        {/* Min Stock Marker */}
                                                        <div
                                                            className="absolute top-0 bottom-0 w-0.5 bg-red-400/50 z-10"
                                                            style={{ left: `${minStockPercent}%` }}
                                                            title={`Min Stok: ${item.minStockLevel}`}
                                                        />
                                                        {/* Reserved Bar */}
                                                        <div
                                                            className="h-full bg-orange-400 rounded-l-full"
                                                            style={{ width: `${reservedPercent}%`, float: 'left' }}
                                                        />
                                                        {/* Remaining Bar */}
                                                        <div
                                                            className={`h-full ${item.projectedStock < item.minStockLevel ? 'bg-red-500' : 'bg-green-500'}`}
                                                            style={{ width: `${Math.max(0, remainingPercent)}%`, float: 'left' }}
                                                        />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right py-3 pr-4">
                                                <div className="flex flex-col items-end gap-0.5">
                                                    <span className={`text-sm font-bold font-mono ${item.projectedStock < 0 ? "text-red-600" : "text-foreground"}`}>
                                                        {item.projectedStock}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                        Tahmini
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
