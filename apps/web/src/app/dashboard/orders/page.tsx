"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Search, Filter, MoreHorizontal, Eye, FileText, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { fetchOrders, deleteOrder, startProduction, Order } from "@/lib/api-client"

export default function OrdersPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadOrders()
    }, [])

    async function loadOrders() {
        setLoading(true)
        try {
            const data = await fetchOrders()
            setOrders(data)
        } catch (error) {
            console.error("Failed to load orders:", error)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Bu siparişi silmek istediğinize emin misiniz?")) return

        try {
            await deleteOrder(id)
            await loadOrders()
        } catch (error) {
            console.error("Failed to delete order:", error)
            alert("Sipariş silinemedi. Lütfen tekrar deneyin.")
        }
    }

    const filteredOrders = orders.filter(order =>
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "COMPLETED": return "default"
            case "SHIPPED": return "secondary"
            case "PENDING": return "outline"
            default: return "default"
        }
    }

    return (
        <div className="flex flex-col gap-4 animate-fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Siparişler</h1>
                <Link href="/dashboard/orders/new">
                    <Button className="shadow-lg shadow-primary/20">
                        <Plus className="mr-2 h-4 w-4" /> Yeni Sipariş
                    </Button>
                </Link>
            </div>
            <Card x-chunk="dashboard-05-chunk-3" className="glass border-none shadow-md">
                <CardHeader className="px-7">
                    <CardTitle>Son Siparişler</CardTitle>
                    <CardDescription>
                        Müşteri siparişlerini ve üretim durumlarını görüntüleyin ve yönetin.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Sipariş ara..."
                                className="pl-9 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-white/50 border-none shadow-sm focus-visible:ring-primary"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon" className="bg-white/50 border-none shadow-sm hover:bg-white/80">
                            <Filter className="h-4 w-4" />
                            <span className="sr-only">Filter</span>
                        </Button>
                    </div>
                    {loading ? (
                        <div className="text-center py-12 text-muted-foreground">
                            Siparişler yükleniyor...
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            Sipariş bulunamadı. Oluşturmak için &quot;Yeni Sipariş&quot;e tıklayın.
                        </div>
                    ) : (
                        <div className="rounded-md border bg-white/50">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-b-primary/10">
                                        <TableHead className="font-semibold text-primary">Sipariş No</TableHead>
                                        <TableHead className="font-semibold text-primary">Müşteri</TableHead>
                                        <TableHead className="hidden sm:table-cell font-semibold text-primary">Tarih</TableHead>
                                        <TableHead className="hidden md:table-cell font-semibold text-primary">Durum</TableHead>
                                        <TableHead className="text-right font-semibold text-primary">Toplam</TableHead>
                                        <TableHead className="text-right font-semibold text-primary">İşlemler</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.map((order) => (
                                        <TableRow key={order.id} className="hover:bg-primary/5 border-b-primary/5 transition-colors">
                                            <TableCell className="font-medium">{order.id.substring(0, 8)}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">{order.customerName}</div>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell text-muted-foreground">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <Badge className="text-xs font-semibold shadow-none" variant={getStatusVariant(order.status)}>
                                                    {order.status === 'IN_PRODUCTION' && order.production?.currentStage
                                                        ? order.production.currentStage
                                                        : order.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                ${order.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button aria-haspopup="true" size="icon" variant="ghost" className="hover:bg-primary/10 hover:text-primary">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Toggle menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="glass border-none shadow-lg">
                                                        <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                                                        {order.status === 'PENDING' && (
                                                            <DropdownMenuItem onClick={async () => {
                                                                if (confirm("Bu sipariş için üretimi başlatmak istiyor musunuz?")) {
                                                                    try {
                                                                        await startProduction(order.id);
                                                                        loadOrders();
                                                                    } catch {
                                                                        alert("Üretim başlatılamadı");
                                                                    }
                                                                }
                                                            }} className="cursor-pointer focus:bg-primary/10 focus:text-primary">
                                                                <div className="flex items-center text-blue-600">
                                                                    <FileText className="mr-2 h-4 w-4" /> Üretimi Başlat
                                                                </div>
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem asChild className="cursor-pointer focus:bg-primary/10 focus:text-primary">
                                                            <Link href={`/dashboard/orders/${order.id}`} className="flex items-center">
                                                                <Eye className="mr-2 h-4 w-4" /> Detayları Gör
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild className="cursor-pointer focus:bg-primary/10 focus:text-primary">
                                                            <Link href={`/dashboard/orders/${order.id}/proforma`} className="flex items-center">
                                                                <FileText className="mr-2 h-4 w-4" /> Proforma
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-700"
                                                            onClick={() => handleDelete(order.id)}
                                                        >
                                                            <Trash className="mr-2 h-4 w-4" /> Sil
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
