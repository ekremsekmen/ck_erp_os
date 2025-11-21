"use client"

import { useState, useEffect } from "react"
import { Plus, Search, MoreHorizontal, Edit, Trash, ShoppingBag, FileText, Eye } from "lucide-react"

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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { CustomerFormDialog } from "@/components/forms/customer-form-dialog"
import { fetchCustomers, deleteCustomer, fetchCustomerOrders, Customer, Order } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function CustomersPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [customerOrders, setCustomerOrders] = useState<Order[]>([])
    const [loadingOrders, setLoadingOrders] = useState(false)
    const [ordersOpen, setOrdersOpen] = useState(false)

    useEffect(() => {
        loadCustomers()
    }, [])

    async function loadCustomers() {
        setLoading(true)
        try {
            const data = await fetchCustomers()
            setCustomers(data)
        } catch (error) {
            console.error("Failed to load customers:", error)
        } finally {
            setLoading(false)
        }
    }

    async function handleViewOrders(customer: Customer) {
        setSelectedCustomer(customer)
        setOrdersOpen(true)
        setLoadingOrders(true)
        try {
            const orders = await fetchCustomerOrders(customer.id)
            setCustomerOrders(orders)
        } catch (error) {
            console.error("Failed to load customer orders:", error)
            alert("Siparişler yüklenemedi.")
        } finally {
            setLoadingOrders(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Bu müşteriyi silmek istediğinize emin misiniz?")) return

        try {
            await deleteCustomer(id)
            await loadCustomers()
        } catch (error) {
            console.error("Failed to delete customer:", error)
            alert("Müşteri silinemedi.")
        }
    }

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="flex flex-col gap-4 animate-fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Müşteriler</h1>
                <CustomerFormDialog onSuccess={loadCustomers} />
            </div>
            <Card className="glass border-none shadow-md">
                <CardHeader className="px-7">
                    <CardTitle>Müşteri Listesi</CardTitle>
                    <CardDescription>
                        Müşterilerinizi yönetin ve siparişler için kullanın.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Müşteri ara..."
                                className="pl-9 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-white/50 border-none shadow-sm focus-visible:ring-primary"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Müşteriler yükleniyor...
                        </div>
                    ) : filteredCustomers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Müşteri bulunamadı. Oluşturmak için &quot;Müşteri Ekle&quot;ye tıklayın.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b-primary/10">
                                    <TableHead className="font-semibold text-primary">İsim / Ünvan</TableHead>
                                    <TableHead className="font-semibold text-primary">İletişim</TableHead>
                                    <TableHead className="hidden md:table-cell font-semibold text-primary">Adres</TableHead>
                                    <TableHead className="text-right font-semibold text-primary">İşlemler</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCustomers.map((customer) => (
                                    <TableRow key={customer.id} className="hover:bg-primary/5 border-b-primary/5 transition-colors">
                                        <TableCell className="font-medium">{customer.name}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{customer.email}</span>
                                                <span className="text-xs text-muted-foreground">{customer.phone}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-muted-foreground max-w-xs truncate">
                                            {customer.address || "-"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost" className="hover:bg-primary/10">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Toggle menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="glass border-none shadow-lg">
                                                    <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                        className="focus:bg-primary/10 cursor-pointer"
                                                        onClick={() => handleViewOrders(customer)}
                                                    >
                                                        <ShoppingBag className="mr-2 h-4 w-4" /> Siparişleri Gör
                                                    </DropdownMenuItem>
                                                    <CustomerFormDialog
                                                        customer={customer}
                                                        onSuccess={loadCustomers}
                                                        trigger={
                                                            <DropdownMenuItem
                                                                className="focus:bg-primary/10 cursor-pointer"
                                                                onSelect={(e) => e.preventDefault()}
                                                            >
                                                                <Edit className="mr-2 h-4 w-4" /> Düzenle
                                                            </DropdownMenuItem>
                                                        }
                                                    />
                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer"
                                                        onClick={() => handleDelete(customer.id)}
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
                    )}
                </CardContent>
            </Card>

            <Dialog open={ordersOpen} onOpenChange={setOrdersOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto glass border-none">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5 text-primary" />
                            {selectedCustomer?.name} - Sipariş Geçmişi
                        </DialogTitle>
                        <DialogDescription>
                            Bu müşteriye ait tüm siparişler aşağıda listelenmiştir.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                        {loadingOrders ? (
                            <div className="text-center py-8 text-muted-foreground">Siparişler yükleniyor...</div>
                        ) : customerOrders.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">Bu müşteriye ait sipariş bulunamadı.</div>
                        ) : (
                            <div className="space-y-4">
                                {customerOrders.map((order) => (
                                    <div key={order.id} className="border rounded-lg p-4 bg-white/50 hover:bg-white/80 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="text-xs text-muted-foreground">Sipariş ID: {order.id.substring(0, 8)}...</span>
                                                <div className="font-semibold mt-1">
                                                    ${order.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </div>
                                            </div>
                                            <Badge variant={
                                                order.status === 'COMPLETED' ? 'default' :
                                                    order.status === 'IN_PRODUCTION' ? 'secondary' :
                                                        'outline'
                                            }>
                                                {order.status}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                                        </div>
                                        {order.production && (
                                            <div className="mt-2 text-xs bg-primary/5 p-2 rounded text-primary font-medium">
                                                Üretim Durumu: {order.production.currentStage}
                                            </div>
                                        )}
                                        <div className="flex gap-2 mt-3 justify-end">
                                            <Link href={`/dashboard/orders/${order.id}`} target="_blank">
                                                <Button variant="outline" size="sm" className="h-8">
                                                    <Eye className="mr-2 h-3 w-3" /> Detaylar
                                                </Button>
                                            </Link>
                                            <Link href={`/dashboard/orders/${order.id}/proforma`} target="_blank">
                                                <Button variant="outline" size="sm" className="h-8">
                                                    <FileText className="mr-2 h-3 w-3" /> Proforma
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
