"use client"

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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createCustomer, updateCustomer, Customer } from "@/lib/api-client"

const customerFormSchema = z.object({
    name: z.string().min(2, { message: "İsim en az 2 karakter olmalıdır." }),
    email: z.string().email({ message: "Geçerli bir e-posta adresi girin." }).optional().or(z.literal("")),
    phone: z.string().optional(),
    address: z.string().optional(),
    taxId: z.string().optional(),
    taxOffice: z.string().optional(),
})

type CustomerFormValues = z.infer<typeof customerFormSchema>

interface CustomerFormDialogProps {
    customer?: Customer
    onSuccess?: () => void
    trigger?: React.ReactNode
}

export function CustomerFormDialog({ customer, onSuccess, trigger }: CustomerFormDialogProps) {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<CustomerFormValues>({
        resolver: zodResolver(customerFormSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            address: "",
            taxId: "",
            taxOffice: "",
        },
    })

    // Reset form when customer changes or dialog opens
    useEffect(() => {
        if (open) {
            if (customer) {
                form.reset({
                    name: customer.name,
                    email: customer.email || "",
                    phone: customer.phone || "",
                    address: customer.address || "",
                    taxId: customer.taxId || "",
                    taxOffice: customer.taxOffice || "",
                })
            } else {
                form.reset({
                    name: "",
                    email: "",
                    phone: "",
                    address: "",
                    taxId: "",
                    taxOffice: "",
                })
            }
        }
    }, [customer, form, open])

    async function onSubmit(data: CustomerFormValues) {
        setIsSubmitting(true)
        try {
            if (customer) {
                await updateCustomer(customer.id, data)
            } else {
                await createCustomer(data)
            }
            setOpen(false)
            onSuccess?.()
        } catch (error) {
            console.error("Failed to save customer:", error)
            alert("Müşteri kaydedilemedi.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? trigger : (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Müşteri Ekle
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>{customer ? "Müşteriyi Düzenle" : "Yeni Müşteri Ekle"}</DialogTitle>
                    <DialogDescription>
                        {customer ? "Müşteri bilgilerini güncelleyin." : "Yeni bir müşteri kaydı oluşturun."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Müşteri Adı / Ünvanı</FormLabel>
                                    <FormControl>
                                        <Input placeholder="ABC İnşaat Ltd. Şti." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>E-posta</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="info@abc.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Telefon</FormLabel>
                                        <FormControl>
                                            <Input placeholder="0532 123 45 67" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Adres</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Adres detayları..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="taxId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vergi No / TC</FormLabel>
                                        <FormControl>
                                            <Input placeholder="1234567890" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="taxOffice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vergi Dairesi</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Zincirlikuyu VD" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
