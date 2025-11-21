"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Trash } from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"
import { createProduct } from "@/lib/api-client"

const productFormSchema = z.object({
    name: z.string().min(2, {
        message: "Ürün adı en az 2 karakter olmalıdır.",
    }),
    basePrice: z.coerce.number().positive({
        message: "Taban fiyat pozitif bir sayı olmalıdır.",
    }),
    description: z.string().optional(),
    recipe: z.array(z.object({
        materialId: z.string(),
        quantity: z.coerce.number().positive()
    })).optional()
})

type ProductFormValues = z.infer<typeof productFormSchema>

interface ProductFormDialogProps {
    onSuccess?: () => void
}

export function ProductFormDialog({ onSuccess }: ProductFormDialogProps) {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [materials, setMaterials] = useState<any[]>([])

    // Load materials when dialog opens
    useEffect(() => {
        if (open) {
            import("@/lib/api-client").then(({ fetchMaterials }) => {
                fetchMaterials().then(setMaterials).catch(console.error)
            })
        }
    }, [open])

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema) as any,
        defaultValues: {
            name: "",
            basePrice: 0,
            description: "",
            recipe: [],
        },
    })

    // Helper to manage recipe items
    const recipeItems = form.watch("recipe") || []

    const addRecipeItem = () => {
        const currentRecipe = form.getValues("recipe") || []
        form.setValue("recipe", [...currentRecipe, { materialId: "", quantity: 1 }])
    }

    const removeRecipeItem = (index: number) => {
        const currentRecipe = form.getValues("recipe") || []
        form.setValue("recipe", currentRecipe.filter((_, i) => i !== index))
    }

    async function onSubmit(data: ProductFormValues) {
        setIsSubmitting(true)
        try {
            // Filter out incomplete recipe items
            const cleanData = {
                ...data,
                recipe: data.recipe?.filter(item => item.materialId && item.quantity > 0)
            }

            await createProduct(cleanData)
            form.reset()
            setOpen(false)
            onSuccess?.()
        } catch (error) {
            console.error("Failed to create product:", error)
            alert("Ürün oluşturulamadı. Lütfen tekrar deneyin.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Ürün Ekle
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Yeni Ürün Ekle</DialogTitle>
                    <DialogDescription>
                        Kataloğunuza yeni bir ürün ekleyin. Reçete oluşturarak stok takibini otomatikleştirebilirsiniz.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">Temel Bilgiler</h3>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ürün Adı</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Çelik Kapı Model A" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="basePrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Taban Fiyat ($)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" placeholder="1200.00" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Açıklama</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Ürün açıklaması..."
                                                className="resize-none h-20"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h3 className="text-sm font-medium text-muted-foreground">Ürün Reçetesi (Malzemeler)</h3>
                                <Button type="button" variant="outline" size="sm" onClick={addRecipeItem}>
                                    <Plus className="mr-2 h-3 w-3" /> Malzeme Ekle
                                </Button>
                            </div>

                            {recipeItems.length === 0 && (
                                <div className="text-sm text-muted-foreground text-center py-4 bg-muted/20 rounded-md border border-dashed">
                                    Henüz malzeme eklenmemiş.
                                </div>
                            )}

                            <div className="space-y-3">
                                {recipeItems.map((_, index) => (
                                    <div key={index} className="flex items-end gap-3 p-3 bg-muted/10 rounded-lg border">
                                        <FormField
                                            control={form.control}
                                            name={`recipe.${index}.materialId`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel className="text-xs">Malzeme</FormLabel>
                                                    <select
                                                        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                        {...field}
                                                    >
                                                        <option value="">Seçiniz...</option>
                                                        {materials.map((m) => (
                                                            <option key={m.id} value={m.id}>
                                                                {m.name} ({m.unit})
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`recipe.${index}.quantity`}
                                            render={({ field }) => (
                                                <FormItem className="w-24">
                                                    <FormLabel className="text-xs">Miktar</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" step="0.1" min="0.1" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => removeRecipeItem(index)}
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                                {isSubmitting ? "Oluşturuluyor..." : "Ürünü Kaydet"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
