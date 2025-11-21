"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, Lock, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"


const formSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters.",
    }),
})

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        // TODO: Integrate with actual API
        console.log(values)
        setTimeout(() => {
            setIsLoading(false)
            router.push("/dashboard")
        }, 2000)
    }

    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
            <div className="flex items-center justify-center py-12">
                <div className="mx-auto grid w-[350px] gap-6">
                    <div className="grid gap-2 text-center">
                        <h1 className="text-3xl font-bold">Giriş Yap</h1>
                        <p className="text-balance text-muted-foreground">
                            Hesabınıza giriş yapmak için e-postanızı girin
                        </p>
                    </div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>E-posta</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input placeholder="m@ornek.com" className="pl-9" {...field} />
                                            </div>
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
                                        <div className="flex items-center">
                                            <FormLabel>Şifre</FormLabel>
                                            <Link
                                                href="/forgot-password"
                                                className="ml-auto inline-block text-sm underline"
                                            >
                                                Şifrenizi mi unuttunuz?
                                            </Link>
                                        </div>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input type="password" placeholder="******" className="pl-9" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Giriş Yap
                            </Button>
                            <Button variant="outline" className="w-full">
                                Google ile Giriş Yap
                            </Button>
                        </form>
                    </Form>
                    <div className="mt-4 text-center text-sm">
                        Hesabınız yok mu?{" "}
                        <Link href="/register" className="underline">
                            Kayıt Ol
                        </Link>
                    </div>
                </div>
            </div>
            <div className="hidden bg-muted lg:block relative h-full w-full overflow-hidden">
                <Image
                    src="/steel_door_factory_login_bg.png"
                    alt="Factory Image"
                    fill
                    className="object-cover dark:brightness-[0.2] dark:grayscale"
                    priority
                />
                <div className="absolute inset-0 bg-zinc-900/50 mix-blend-multiply" />
                <div className="absolute bottom-10 left-10 right-10 text-white z-20">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;AtölyeOS has revolutionized our production line. The efficiency and tracking capabilities are unmatched in the industry.&rdquo;
                        </p>
                        <footer className="text-sm">Sofia Davis</footer>
                    </blockquote>
                </div>
            </div>
        </div>
    )
}
