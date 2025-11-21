"use client"

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useMaterialPriceHistory } from "@/hooks/use-material-price-history"

import { cn } from "@/lib/utils"

interface MaterialPriceChartProps {
    className?: string
}

export function MaterialPriceChart({ className }: MaterialPriceChartProps) {
    const {
        materials,
        selectedMaterialId,
        setSelectedMaterialId,
        priceHistory,
        selectedMaterial
    } = useMaterialPriceHistory()

    // Combine history with current price for a complete view
    const chartData = [
        ...priceHistory.map(h => ({
            date: h.changedAt,
            price: h.price,
            formattedDate: format(new Date(h.changedAt), 'd MMM yyyy', { locale: tr })
        })),
        // Add current price as the latest point if we have a selected material
        ...(selectedMaterial ? [{
            date: new Date().toISOString(),
            price: selectedMaterial.unitPrice,
            formattedDate: 'Güncel'
        }] : [])
    ]

    return (
        <Card className={cn("col-span-full border-border/50 shadow-sm bg-card/50 backdrop-blur-sm flex flex-col", className)}>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base font-semibold">Hammadde Fiyat Analizi</CardTitle>
                        <CardDescription className="text-xs">
                            Fiyat değişim geçmişi
                        </CardDescription>
                    </div>
                    <Select value={selectedMaterialId} onValueChange={setSelectedMaterialId}>
                        <SelectTrigger className="w-[200px] h-8 text-xs">
                            <SelectValue placeholder="Malzeme Seçin" />
                        </SelectTrigger>
                        <SelectContent>
                            {materials.map((material) => (
                                <SelectItem key={material.id} value={material.id} className="text-xs">
                                    {material.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 pb-4">
                <div className="h-full w-full">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 30, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                                <XAxis
                                    dataKey="formattedDate"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value} ${selectedMaterial?.currency || 'TRY'}`}
                                    dx={-10}
                                    domain={['auto', 'auto']}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--background))",
                                        border: "1px solid hsl(var(--border))",
                                        borderRadius: "8px",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    }}
                                    itemStyle={{ color: "hsl(var(--foreground))", fontSize: '12px', fontWeight: 500 }}
                                    formatter={(value: number) => [`${value} ${selectedMaterial?.currency || 'TRY'}`, "Birim Fiyat"]}
                                    labelFormatter={(label) => `Tarih: ${label}`}
                                    cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "4 4" }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="price"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorPrice)"
                                    dot={{ r: 4, fill: "hsl(var(--background))", stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                                    activeDot={{ r: 6, strokeWidth: 0, fill: "hsl(var(--primary))" }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                            Görüntülenecek veri yok.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
