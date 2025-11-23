'use client';

import { useEffect, useState } from 'react';
import { fetchProducts, fetchCostAnalysis, Product, CostAnalysis } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function CostAnalysisCard({ className }: { className?: string }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [analysis, setAnalysis] = useState<CostAnalysis | null>(null);

    useEffect(() => {
        fetchProducts().then((data) => {
            setProducts(data);
            if (data.length > 0) {
                setSelectedProductId(data[0].id);
            }
        });
    }, []);

    useEffect(() => {
        if (selectedProductId) {
            fetchCostAnalysis(selectedProductId).then(setAnalysis);
        }
    }, [selectedProductId]);

    return (
        <Card className={`shadow-sm border-0 bg-white/50 backdrop-blur-sm ${className}`}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center gap-2">
                    <CardTitle className="text-lg font-semibold whitespace-nowrap">Maliyet Analizi</CardTitle>
                    <Select onValueChange={setSelectedProductId} value={selectedProductId}>
                        <SelectTrigger className="w-[180px] h-8 text-xs">
                            <SelectValue placeholder="Ürün Seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                            {products.map((p) => (
                                <SelectItem key={p.id} value={p.id} className="text-xs">{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="gap-4 pt-0">
                {analysis ? (
                    <div className="space-y-4">
                        {/* Summary Section */}
                        <div className="space-y-2 bg-muted/30 p-3 rounded-lg border">
                            <div className="flex justify-between items-end">
                                <div>
                                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Toplam Maliyet</span>
                                    <div className="text-2xl font-bold text-green-600 leading-none mt-0.5">
                                        {analysis.currentTotalCost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-muted-foreground">En Yüksek Kalem</span>
                                    <div className="text-sm font-medium truncate max-w-[120px]">
                                        {analysis.materialCosts[0]?.materialName}
                                    </div>
                                </div>
                            </div>

                            {/* Stacked Bar Chart */}
                            <div className="space-y-1">
                                <div className="h-2.5 w-full flex rounded-full overflow-hidden bg-secondary">
                                    {analysis.materialCosts.slice(0, 4).map((m, i) => {
                                        const percentage = (m.totalCost / analysis.currentTotalCost) * 100;
                                        const colors = ['bg-primary', 'bg-blue-500', 'bg-orange-500', 'bg-green-500'];
                                        return (
                                            <div
                                                key={i}
                                                className={`h-full ${colors[i % colors.length]}`}
                                                style={{ width: `${percentage}%` }}
                                                title={`${m.materialName}: %${percentage.toFixed(1)}`}
                                            />
                                        );
                                    })}
                                </div>
                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                    <span>Maliyet Dağılımı</span>
                                    <span>%100</span>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Table */}
                        <div className="rounded-md border overflow-hidden bg-white">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50 hover:bg-muted/50 h-8">
                                        <TableHead className="h-8 text-[10px] w-[40%]">Malzeme</TableHead>
                                        <TableHead className="h-8 text-[10px] text-right">Adet</TableHead>
                                        <TableHead className="h-8 text-[10px] text-right">Birim</TableHead>
                                        <TableHead className="h-8 text-[10px] text-right">Toplam</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {analysis.materialCosts.map((m, i) => {
                                        const colors = ['bg-primary', 'bg-blue-500', 'bg-orange-500', 'bg-green-500'];
                                        const isTop4 = i < 4;
                                        return (
                                            <TableRow key={i} className="hover:bg-muted/50 text-[10px] h-8">
                                                <TableCell className="py-1 font-medium truncate max-w-[150px]" title={m.materialName}>
                                                    <div className="flex items-center gap-2">
                                                        {isTop4 && (
                                                            <div className={`w-2 h-2 rounded-full shrink-0 ${colors[i % colors.length]}`} />
                                                        )}
                                                        {!isTop4 && (
                                                            <div className="w-2 h-2 rounded-full shrink-0 bg-gray-200" />
                                                        )}
                                                        <span className="truncate">{m.materialName}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-1 text-right">{m.quantity}</TableCell>
                                                <TableCell className="py-1 text-right">
                                                    {m.unitPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                                </TableCell>
                                                <TableCell className="py-1 text-right font-bold">
                                                    {m.totalCost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-2 text-muted-foreground">
                        <div className="p-2 bg-muted rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                        </div>
                        <p className="text-xs">Ürün seçiniz</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
