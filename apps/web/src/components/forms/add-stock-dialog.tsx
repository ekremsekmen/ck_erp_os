"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus } from "lucide-react"

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
import { updateMaterial, Material } from "@/lib/api-client"

const addStockSchema = z.object({
    quantity: z.coerce.number().min(0.01, {
        message: "Miktar 0'dan büyük olmalıdır.",
    }),
    unitPrice: z.coerce.number().min(0, {
        message: "Birim fiyat 0 veya daha büyük olmalıdır.",
    }),
})

type AddStockValues = z.infer<typeof addStockSchema>

interface AddStockDialogProps {
    material: Material
    onSuccess?: () => void
    trigger?: React.ReactNode
}

export function AddStockDialog({ material, onSuccess, trigger }: AddStockDialogProps) {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<AddStockValues>({
        resolver: zodResolver(addStockSchema) as any,
        defaultValues: {
            quantity: 0,
            unitPrice: material.unitPrice,
        },
    })

    async function onSubmit(data: AddStockValues) {
        setIsSubmitting(true)
        try {
            // Calculate new stock level
            const newStock = material.currentStock + data.quantity

            // Update material with new stock and potentially new price
            await updateMaterial(material.id, {
                ...material, // Keep other fields
                currentStock: newStock,
                unitPrice: data.unitPrice,
            })

            setOpen(false)
            form.reset()
            onSuccess?.()
        } catch (error) {
            console.error("Failed to add stock:", error)
            alert("Stok eklenemedi. Lütfen tekrar deneyin.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? trigger : (
                    <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Stok Ekle
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Stok Ekle: {material.name}</DialogTitle>
                    <DialogDescription>
                        Mevcut stoğa ekleme yapın ve birim fiyatı güncelleyin.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Eklenecek Miktar ({material.unit})</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" placeholder="0" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Mevcut Stok: {material.currentStock} {material.unit}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="unitPrice"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Yeni Birim Fiyat ({material.currency})</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Eski Fiyat: {material.unitPrice} {material.currency}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Ekleniyor..." : "Stok Ekle"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
