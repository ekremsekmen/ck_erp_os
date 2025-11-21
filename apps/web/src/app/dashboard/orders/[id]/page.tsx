"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, FileText, Factory, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { fetchOrder, Order, startProduction } from "@/lib/api-client"

export default function OrderDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (params.id) {
            loadOrder(params.id as string)
        }
    }, [params.id])

    async function loadOrder(id: string) {
        try {
            const data = await fetchOrder(id)
            setOrder(data)
        } catch (error) {
            console.error("Failed to load order:", error)
            alert("Sipariş detayları yüklenemedi")
        } finally {
            setLoading(false)
        }
    }

    const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case 'PENDING':
                return 'outline';
            case 'IN_PRODUCTION':
                return 'default';
            case 'SHIPPED':
                return 'secondary';
            case 'DELIVERED':
                return 'secondary';
            case 'CANCELLED':
                return 'destructive';
            default:
                return 'default';
        }
    };

    const handleStartProduction = async () => {
        if (!order) return;
        try {
            await startProduction(order.id as string); // Ensure ID is string
            alert("Üretim başarıyla başlatıldı.");
            // Reload order to update status
            await loadOrder(order.id);
        } catch (error) {
            console.error("Failed to start production:", error);
            alert("Üretim başlatılamadı.");
        }
    };

    const formatAttributes = (attributes: any) => {
        if (!attributes) return 'N/A';

        try {
            const parsedAttributes = typeof attributes === 'string'
                ? JSON.parse(attributes)
                : attributes;

            if (!parsedAttributes || typeof parsedAttributes !== 'object') return attributes;

            const attributeStrings: string[] = [];
            for (const key in parsedAttributes) {
                if (Object.prototype.hasOwnProperty.call(parsedAttributes, key)) {
                    const value = parsedAttributes[key];
                    const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'); // Basic camelCase to Title Case
                    let formattedValue = value;

                    if (Array.isArray(value)) {
                        formattedValue = value.join(', ');
                    } else if (typeof value === 'boolean') {
                        formattedValue = value ? 'Evet' : 'Hayır';
                    } else if (key.toLowerCase().includes('width') || key.toLowerCase().includes('height') || key.toLowerCase().includes('depth')) {
                        formattedValue = `${value} cm`;
                    }

                    attributeStrings.push(`${formattedKey}: ${formattedValue}`);
                }
            }
            return attributeStrings.join(' | ');
        } catch (e) {
            console.error("Failed to parse or format attributes:", e);
            return attributes;
        }
    };

    if (loading) return <div className="p-8 text-center">Yükleniyor...</div>
    if (!order) return <div className="p-8 text-center">Sipariş bulunamadı</div>

    // Removed customerInfo parsing as per new structure

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/orders">
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full shadow-sm">
                            <ChevronLeft className="h-5 w-5" />
                            <span className="sr-only">Geri</span>
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                        Sipariş #{order.id.substring(0, 8)}
                    </h1>
                    <Badge variant={getStatusVariant(order.status)} className="text-sm px-3 py-1 shadow-sm">
                        {order.status === 'IN_PRODUCTION' && (order as any).production?.currentStage // Assuming production exists on Order type
                            ? (order as any).production.currentStage
                            : order.status}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <a href={`http://localhost:3001/orders/${order.id}/proforma`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="shadow-sm hover:bg-primary/5">
                            <FileText className="mr-2 h-4 w-4" />
                            Proforma İndir
                        </Button>
                    </a>
                    {order.status === 'PENDING' && (
                        <Button onClick={handleStartProduction} className="shadow-lg shadow-primary/20">
                            <Factory className="mr-2 h-4 w-4" />
                            Üretimi Başlat
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="glass border-none shadow-md h-full">
                    <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
                        <CardTitle className="text-lg text-primary flex items-center gap-2">
                            <Users className="h-5 w-5" /> Müşteri Bilgileri
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 grid gap-4">
                        <div className="grid grid-cols-3 gap-1">
                            <span className="text-sm font-medium text-muted-foreground">İsim:</span>
                            <span className="col-span-2 text-sm font-semibold">{order.customerName}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                            <span className="text-sm font-medium text-muted-foreground">E-posta:</span>
                            <span className="col-span-2 text-sm">{(order as any).customerEmail}</span> {/* Assuming customerEmail exists */}
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                            <span className="text-sm font-medium text-muted-foreground">Telefon:</span>
                            <span className="col-span-2 text-sm">{(order as any).customerPhone}</span> {/* Assuming customerPhone exists */}
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                            <span className="text-sm font-medium text-muted-foreground">Adres:</span>
                            <span className="col-span-2 text-sm">{(order as any).shippingAddress}</span> {/* Assuming shippingAddress exists */}
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass border-none shadow-md h-full">
                    <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
                        <CardTitle className="text-lg text-primary flex items-center gap-2">
                            <FileText className="h-5 w-5" /> Sipariş Özeti
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 grid gap-4">
                        <div className="grid grid-cols-3 gap-1">
                            <span className="text-sm font-medium text-muted-foreground">Oluşturulma:</span>
                            <span className="col-span-2 text-sm">{new Date(order.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                            <span className="text-sm font-medium text-muted-foreground">Son Güncelleme:</span>
                            <span className="col-span-2 text-sm">{new Date(order.updatedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1 items-center mt-2">
                            <span className="text-sm font-medium text-muted-foreground">Toplam Tutar:</span>
                            <span className="col-span-2 text-xl font-bold text-primary">
                                ${order.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="glass border-none shadow-md">
                <CardHeader className="px-6 py-4 border-b border-primary/10">
                    <CardTitle className="text-lg">Sipariş Kalemleri</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent bg-muted/30">
                                <TableHead className="pl-6">Ürün</TableHead>
                                <TableHead>Özellikler</TableHead>
                                <TableHead className="text-right">Birim Fiyat</TableHead>
                                <TableHead className="text-right">Adet</TableHead>
                                <TableHead className="text-right pr-6">Toplam</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(order as any).items?.map((item: any) => (
                                <TableRow key={item.id} className="hover:bg-primary/5 transition-colors">
                                    <TableCell className="pl-6 font-medium">
                                        {item.product?.name || 'Bilinmeyen Ürün'}
                                        <div className="text-xs text-muted-foreground mt-0.5">{item.product?.description}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-muted-foreground max-w-md">
                                            {formatAttributes(item.attributes)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        ${item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                                    <TableCell className="text-right pr-6 font-bold">
                                        ${(item.quantity * item.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div >
    )
}
