"use client"

import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    LabelList,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ChartProps {
    data: any[]
    className?: string
}

export function RevenueChart({ data, className }: ChartProps) {
    return (
        <Card className={cn("border-border/50 shadow-sm bg-card/50 backdrop-blur-sm flex flex-col", className)}>
            <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">Gelir Analizi</CardTitle>
                <CardDescription className="text-xs">Son 6 aylık gelir tablosu</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 pb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 30, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="name"
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
                            tickFormatter={(value) => `$${value}`}
                            dx={-10}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            }}
                            itemStyle={{ color: "hsl(var(--foreground))", fontSize: '12px', fontWeight: 500 }}
                            formatter={(value: number) => [`$${value.toLocaleString()}`, "Gelir"]}
                            cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "4 4" }}
                        />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                        <Area
                            type="monotone"
                            dataKey="total"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}


export function ProductionChart({ data, className }: ChartProps) {
    return (
        <Card className={cn("border-border/50 shadow-sm bg-card/50 backdrop-blur-sm flex flex-col", className)}>
            <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">Üretim Durumu</CardTitle>
                <CardDescription className="text-xs">İstasyonlardaki iş yükü</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 pb-4 pl-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={130}
                            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }}
                            axisLine={false}
                            tickLine={false}
                            interval={0}
                        />
                        <Tooltip
                            cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                            contentStyle={{
                                backgroundColor: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            }}
                            itemStyle={{ color: "hsl(var(--foreground))", fontSize: '12px', fontWeight: 500 }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                            <LabelList dataKey="value" position="right" fill="hsl(var(--foreground))" fontSize={12} fontWeight="bold" offset={10} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
