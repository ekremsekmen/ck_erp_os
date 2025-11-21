import { useState, useEffect } from "react"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createMaterial, updateMaterial, Material } from "@/lib/api-client"

const materialFormSchema = z.object({
    name: z.string().min(2, {
        message: "Malzeme adı en az 2 karakter olmalıdır.",
    }),
    unit: z.string().min(1, {
        message: "Lütfen bir birim seçin.",
    }),
    currentStock: z.coerce.number().min(0, {
        message: "Stok 0 veya daha büyük olmalıdır.",
    }).default(0),
    minStockLevel: z.coerce.number().min(0, {
        message: "Minimum stok seviyesi 0 veya daha büyük olmalıdır.",
    }).default(0),
    unitPrice: z.coerce.number().min(0, {
        message: "Birim fiyat 0 veya daha büyük olmalıdır.",
    }).default(0),
    currency: z.string().default("USD"),
})

type MaterialFormValues = z.infer<typeof materialFormSchema>

interface MaterialFormDialogProps {
    material?: Material
    onSuccess?: () => void
    trigger?: React.ReactNode
}

export function MaterialFormDialog({ material, onSuccess, trigger }: MaterialFormDialogProps) {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<MaterialFormValues>({
        resolver: zodResolver(materialFormSchema) as any, // usage of any is required due to type mismatch in hookform/resolvers
        defaultValues: {
            name: "",
            unit: "",
            currentStock: 0,
            minStockLevel: 0,
            unitPrice: 0,
            currency: "USD",
        },
    })

    useEffect(() => {
        if (open) {
            if (material) {
                form.reset({
                    name: material.name,
                    unit: material.unit,
                    currentStock: material.currentStock,
                    minStockLevel: material.minStockLevel,
                    unitPrice: material.unitPrice,
                    currency: material.currency,
                })
            } else {
                form.reset({
                    name: "",
                    unit: "",
                    currentStock: 0,
                    minStockLevel: 0,
                    unitPrice: 0,
                    currency: "USD",
                })
            }
        }
    }, [material, form, open])

    async function onSubmit(data: MaterialFormValues) {
        setIsSubmitting(true)
        try {
            if (material) {
                await updateMaterial(material.id, data)
            } else {
                await createMaterial(data)
            }
            setOpen(false)
            onSuccess?.()
        } catch (error) {
            console.error("Failed to save material:", error)
            alert("Malzeme kaydedilemedi. Lütfen tekrar deneyin.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? trigger : (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Malzeme Ekle
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>{material ? "Malzemeyi Düzenle" : "Yeni Malzeme Ekle"}</DialogTitle>
                    <DialogDescription>
                        {material ? "Malzeme bilgilerini güncelleyin." : "Envanterinize yeni bir malzeme ekleyin."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Malzeme Adı</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Çelik Levha 2mm" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="unit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Birim</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Birim seçin" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="piece">Adet</SelectItem>
                                                <SelectItem value="kg">Kilogram (kg)</SelectItem>
                                                <SelectItem value="m2">Metrekare (m²)</SelectItem>
                                                <SelectItem value="liter">Litre</SelectItem>
                                                <SelectItem value="sheet">Levha</SelectItem>
                                                <SelectItem value="set">Set</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Para Birimi</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Para birimi seçin" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="USD">USD</SelectItem>
                                                <SelectItem value="EUR">EUR</SelectItem>
                                                <SelectItem value="TRY">TRY</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="currentStock"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mevcut Stok</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" placeholder="0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="minStockLevel"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Min Stok Seviyesi</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" placeholder="0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="unitPrice"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Birim Fiyat</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Birim başına fiyat
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Kaydediliyor..." : (material ? "Güncelle" : "Malzeme Oluştur")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
