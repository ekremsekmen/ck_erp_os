"use client"

import { useState, useEffect } from "react"
import {
    DollarSign,
    Users,
    Factory,
    Truck
} from "lucide-react"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { fetchOrders, fetchProduction, Order } from "@/lib/api-client"
import { RevenueChart, ProductionChart } from "@/components/dashboard/dashboard-charts"
import { MaterialPriceChart } from "@/components/dashboard/material-price-chart"

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        activeOrders: 0,
        inProduction: 0,
        shipped: 0,
        revenueData: [] as any[],
        productionData: [] as any[]
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadStats() {
            try {
                const orders = await fetchOrders()
                const production = await fetchProduction()

                const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)
                const activeOrders = orders.filter(o => o.status === 'PENDING').length
                const inProduction = orders.filter(o => ['IN_PRODUCTION', 'READY_FOR_SHIPMENT'].includes(o.status)).length
                const shipped = orders.filter(o => ['SHIPPED', 'COMPLETED', 'DELIVERED'].includes(o.status)).length

                // Prepare Revenue Data (Mocking monthly distribution for demo based on real total)
                const revenueData = [
                    { name: "Ocak", total: totalRevenue * 0.1 },
                    { name: "Şubat", total: totalRevenue * 0.15 },
                    { name: "Mart", total: totalRevenue * 0.12 },
                    { name: "Nisan", total: totalRevenue * 0.2 },
                    { name: "Mayıs", total: totalRevenue * 0.18 },
                    { name: "Haziran", total: totalRevenue * 0.25 },
                ]

                // Prepare Production Data
                const stageMapping: Record<string, string> = {
                    'CUTTING_BENDING': 'Kesim & Büküm',
                    'WELDING_GRINDING': 'Kaynak & Taşlama',
                    'PAINTING_WASHING': 'Boya & Yıkama',
                    'ASSEMBLY_PACKAGING': 'Montaj & Paketleme',
                    'READY_FOR_SHIPMENT': 'Sevkiyata Hazır'
                }

                const stages = {
                    'Sipariş Alındı': 0,
                    'Kesim & Büküm': 0,
                    'Kaynak & Taşlama': 0,
                    'Boya & Yıkama': 0,
                    'Montaj & Paketleme': 0,
                    'Sevkiyata Hazır': 0
                }

                production.forEach(p => {
                    // Handle both legacy Turkish data and new English codes
                    const stageName = stageMapping[p.currentStage] || p.currentStage
                    if (stages[stageName as keyof typeof stages] !== undefined) {
                        stages[stageName as keyof typeof stages]++
                    } else if (p.currentStage === 'Sipariş Alındı') {
                        stages['Sipariş Alındı']++
                    }
                })

                const productionData = [
                    { name: 'Kesim & Büküm', value: stages['Kesim & Büküm'], color: '#8b5cf6' },
                    { name: 'Kaynak & Taşlama', value: stages['Kaynak & Taşlama'], color: '#ec4899' },
                    { name: 'Boya & Yıkama', value: stages['Boya & Yıkama'], color: '#f97316' },
                    { name: 'Montaj & Paketleme', value: stages['Montaj & Paketleme'], color: '#eab308' },
                    { name: 'Sevkiyata Hazır', value: stages['Sevkiyata Hazır'], color: '#22c55e' },
                ]

                setStats({
                    totalRevenue,
                    activeOrders,
                    inProduction,
                    shipped,
                    revenueData,
                    productionData
                })
            } catch (error) {
                console.error("Failed to load dashboard stats:", error)
            } finally {
                setLoading(false)
            }
        }

        loadStats()
    }, [])

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Panel verileri yükleniyor...</div>
    }

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] gap-4 p-2 overflow-hidden">
            {/* Row 1: Stats - Auto Height */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 shrink-0">
                <Card x-chunk="dashboard-01-chunk-0" className="border-border/50 shadow-sm hover:shadow-md transition-all duration-200 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Toplam Ciro
                        </CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <DollarSign className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground tracking-tight">
                            ${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            <span className="text-emerald-500 font-medium">+20.1%</span> geçen aydan
                        </p>
                    </CardContent>
                </Card>
                <Card x-chunk="dashboard-01-chunk-1" className="border-border/50 shadow-sm hover:shadow-md transition-all duration-200 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Bekleyen Siparişler
                        </CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                            <Users className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground tracking-tight">{stats.activeOrders}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            <span className="text-emerald-500 font-medium">+2</span> yeni sipariş
                        </p>
                    </CardContent>
                </Card>
                <Card x-chunk="dashboard-01-chunk-2" className="border-border/50 shadow-sm hover:shadow-md transition-all duration-200 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Üretimde</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600">
                            <Factory className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground tracking-tight">{stats.inProduction}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            <span className="text-orange-500 font-medium">Aktif</span> üretim hattı
                        </p>
                    </CardContent>
                </Card>
                <Card x-chunk="dashboard-01-chunk-3" className="border-border/50 shadow-sm hover:shadow-md transition-all duration-200 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Sevk Edilen</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600">
                            <Truck className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground tracking-tight">{stats.shipped}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            <span className="text-emerald-500 font-medium">+12%</span> geçen haftadan
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Row 2: Revenue & Production - Flexible Height */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-0">
                <div className="md:col-span-2 h-full min-h-0">
                    <RevenueChart data={stats.revenueData} className="h-full rounded-xl shadow-sm" />
                </div>
                <div className="md:col-span-1 h-full min-h-0">
                    <ProductionChart data={stats.productionData} className="h-full rounded-xl shadow-sm" />
                </div>
            </div>

            {/* Row 3: Material Price - Fixed Percentage Height */}
            <div className="h-[30%] shrink-0 min-h-[180px]">
                <MaterialPriceChart className="h-full rounded-xl shadow-sm" />
            </div>
        </div>
    )
}
