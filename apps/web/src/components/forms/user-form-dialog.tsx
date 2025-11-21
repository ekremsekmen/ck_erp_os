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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createUser } from "@/lib/api-client"

const userFormSchema = z.object({
    email: z.string().email({
        message: "Lütfen geçerli bir e-posta adresi girin.",
    }),
    password: z.string().min(6, {
        message: "Şifre en az 6 karakter olmalıdır.",
    }),
    name: z.string().min(2, {
        message: "İsim en az 2 karakter olmalıdır.",
    }),
    role: z.string().min(1, {
        message: "Lütfen bir rol seçin.",
    }),
})

type UserFormValues = z.infer<typeof userFormSchema>

interface UserFormDialogProps {
    onSuccess?: () => void
}

export function UserFormDialog({ onSuccess }: UserFormDialogProps) {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            email: "",
            password: "",
            name: "",
            role: "WORKER",
        },
    })

    async function onSubmit(data: UserFormValues) {
        setIsSubmitting(true)
        try {
            await createUser(data)
            form.reset()
            setOpen(false)
            onSuccess?.()
        } catch (error) {
            console.error("Failed to create user:", error)
            alert("Kullanıcı oluşturulamadı. Lütfen tekrar deneyin.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Kullanıcı Ekle
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Yeni Kullanıcı Ekle</DialogTitle>
                    <DialogDescription>
                        Yeni bir kullanıcı hesabı oluşturun. İşiniz bittiğinde kaydet&apos;e tıklayın.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ad Soyad</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ahmet Yılmaz" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>E-posta</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="ahmet@ornek.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Şifre</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        En az 6 karakter
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rol</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Bir rol seçin" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="ADMIN">Yönetici (Admin)</SelectItem>
                                            <SelectItem value="MANAGER">Müdür (Manager)</SelectItem>
                                            <SelectItem value="WORKER">Çalışan (Worker)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Kullanıcı erişim seviyesi
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Oluşturuluyor..." : "Kullanıcı Oluştur"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
