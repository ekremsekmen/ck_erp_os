"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { fetchOrder, Order } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Printer, ChevronLeft, Package2 } from "lucide-react"

export default function ProformaPage() {
    const params = useParams()
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
        } finally {
            setLoading(false)
        }
    }

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
                    const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
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
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 animate-fade-in">
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                {/* Toolbar */}
                <div className="bg-gray-900 text-white p-4 flex justify-between items-center print:hidden">
                    <Link href={`/dashboard/orders/${order.id}`}>
                        <Button variant="ghost" size="sm" className="text-white hover:text-gray-200 hover:bg-white/10">
                            <ChevronLeft className="mr-2 h-4 w-4" /> Geri Dön
                        </Button>
                    </Link>
                    <Button onClick={() => window.print()} variant="secondary" size="sm" className="shadow-sm">
                        <Printer className="mr-2 h-4 w-4" /> Yazdır
                    </Button>
                </div>

                <div className="p-8 md:p-12">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-12 border-b pb-8">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-gray-900">
                                <div className="p-1.5 bg-gray-900 rounded-md text-white">
                                    <Package2 className="h-6 w-6" />
                                </div>
                                <span className="text-2xl font-bold tracking-tight">AtölyeOS</span>
                            </div>
                            <div className="text-sm text-gray-500 mt-2">
                                <p>Çelik Kapı Üretim Sistemleri A.Ş.</p>
                                <p>Organize Sanayi Bölgesi, 1. Cadde No: 123</p>
                                <p>İstanbul, Türkiye</p>
                                <p>Tel: +90 212 123 45 67 | Email: info@atolyeos.com</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">PROFORMA</h2>
                            <div className="mt-4 space-y-1">
                                <p className="text-gray-500 text-sm">Fatura No</p>
                                <p className="font-mono font-medium text-lg text-gray-900">#{order.id.substring(0, 8).toUpperCase()}</p>
                            </div>
                            <div className="mt-4 space-y-1">
                                <p className="text-gray-500 text-sm">Tarih</p>
                                <p className="font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>
                    </div>

                    {/* Customer & Order Info */}
                    <div className="grid grid-cols-2 gap-12 mb-12">
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Müşteri Bilgileri</h3>
                            <div className="text-gray-900 space-y-1">
                                <p className="font-bold text-lg">{order.customerName}</p>
                                {(order as any).shippingAddress && <p className="text-gray-600">{(order as any).shippingAddress}</p>}
                                {(order as any).customerPhone && <p className="text-gray-600">Tel: {(order as any).customerPhone}</p>}
                                {(order as any).customerEmail && <p className="text-gray-600">{(order as any).customerEmail}</p>}
                            </div>
                        </div>
                        <div className="text-right">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Sipariş Detayları</h3>
                            <div className="space-y-2">
                                <div className="flex justify-end gap-4">
                                    <span className="text-gray-500">Durum:</span>
                                    <span className="font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 text-xs uppercase">{order.status}</span>
                                </div>
                                <div className="flex justify-end gap-4">
                                    <span className="text-gray-500">Para Birimi:</span>
                                    <span className="font-medium">USD ($)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="rounded-lg border border-gray-200 overflow-hidden mb-12">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Ürün / Açıklama</th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Adet</th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Birim Fiyat</th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Toplam</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {(order as any).items?.map((item: any) => (
                                    <tr key={item.id} className="text-gray-700">
                                        <td className="py-4 px-4">
                                            <p className="font-medium text-gray-900">{item.product?.name || 'Ürün'}</p>
                                            <p className="text-sm text-gray-500 mb-1">{item.product?.description}</p>
                                            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100 inline-block max-w-lg">
                                                {formatAttributes(item.attributes)}
                                            </div>
                                        </td>
                                        <td className="text-right py-4 px-4 align-top">{item.quantity}</td>
                                        <td className="text-right py-4 px-4 align-top">${item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                        <td className="text-right py-4 px-4 font-medium align-top">${(item.quantity * item.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end mb-12">
                        <div className="w-64 space-y-3">
                            <div className="flex justify-between text-gray-600">
                                <span>Ara Toplam</span>
                                <span>${order.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>KDV (%0)</span>
                                <span>$0.00</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between text-xl font-bold text-gray-900">
                                <span>Genel Toplam</span>
                                <span>${order.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t pt-8 text-center text-gray-500 text-sm">
                        <p className="font-medium text-gray-900 mb-1">İşbirliğiniz için teşekkür ederiz!</p>
                        <p>Ödeme Koşulları: %50 Peşin, %50 Sevkiyat Öncesi</p>
                        <p className="mt-4 text-xs text-gray-400">Bu belge bilgisayar ortamında oluşturulmuştur ve imza gerektirmez.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
