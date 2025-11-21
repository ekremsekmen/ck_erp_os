"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createShipment, fetchOrders, Order } from "@/lib/api-client"

const shipmentFormSchema = z.object({
    orderId: z.string().min(1, {
        message: "Lütfen bir sipariş seçin.",
    }),
    waybillNumber: z.string().min(1, {
        message: "İrsaliye numarası gereklidir.",
    }),
    carrierInfo: z.string().optional(),
})

type ShipmentFormValues = z.infer<typeof shipmentFormSchema>

interface ShipmentFormDialogProps {
    onSuccess?: () => void
}

export function ShipmentFormDialog({ onSuccess }: ShipmentFormDialogProps) {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [orders, setOrders] = useState<Order[]>([])
    const [loadingOrders, setLoadingOrders] = useState(false)

    const form = useForm<ShipmentFormValues>({
        resolver: zodResolver(shipmentFormSchema),
        defaultValues: {
            orderId: "",
            waybillNumber: "",
            carrierInfo: "",
        },
    })

    useEffect(() => {
        if (open) {
            loadOrders()
        }
    }, [open])

    async function loadOrders() {
        setLoadingOrders(true)
        try {
            const data = await fetchOrders()
            setOrders(data)
        } catch (error) {
            console.error("Failed to load orders:", error)
        } finally {
            setLoadingOrders(false)
        }
    }

    async function onSubmit(data: ShipmentFormValues) {
        setIsSubmitting(true)
        try {
            await createShipment(data)
            form.reset()
            setOpen(false)
            onSuccess?.()
        } catch (error) {
            console.error("Failed to create shipment:", error)
            alert("Sevkiyat oluşturulamadı. Lütfen tekrar deneyin.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Truck className="mr-2 h-4 w-4" /> Sevkiyat Oluştur
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Yeni Sevkiyat Oluştur</DialogTitle>
                    <DialogDescription>
                        Bir sipariş için sevkiyat oluşturun. Tamamlandığında kaydedin.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="orderId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sipariş</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        disabled={loadingOrders}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={loadingOrders ? "Siparişler yükleniyor..." : "Bir sipariş seçin"} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {orders.filter(o => o.status === 'READY_FOR_SHIPMENT').map((order) => (
                                                <SelectItem key={order.id} value={order.id}>
                                                    {order.customerName} - ${order.totalAmount.toFixed(2)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Sevk edilecek siparişi seçin
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="waybillNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>İrsaliye Numarası</FormLabel>
                                    <FormControl>
                                        <Input placeholder="WB-2024-001" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Benzersiz irsaliye/takip numarası
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="carrierInfo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Taşıyıcı Bilgileri (İsteğe bağlı)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder='{"carrier": "DHL", "tracking": "1234567890"}'
                                            className="resize-none font-mono text-sm"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        JSON formatında taşıyıcı detayları
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Oluşturuluyor..." : "Sevkiyat Oluştur"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
