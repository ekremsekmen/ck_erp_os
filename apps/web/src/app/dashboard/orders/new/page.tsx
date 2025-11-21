"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Check, ChevronsUpDown, Plus, Trash } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { createOrder, fetchProducts, fetchCustomers, Product, Customer } from "@/lib/api-client"
// import { useToast } from "@/hooks/use-toast" 

const colors = [
    { label: "Matte Black", value: "black" },
    { label: "Anthracite Grey", value: "grey" },
    { label: "Traffic White", value: "white" },
    { label: "Walnut Wood Effect", value: "walnut" },
]

const accessories = [
    { label: "Digital Smart Lock", value: "acc_001", price: 150 },
    { label: "Door Closer", value: "acc_002", price: 45 },
    { label: "Stainless Steel Handle", value: "acc_003", price: 35 },
    { label: "Peephole Camera", value: "acc_004", price: 85 },
]

const formSchema = z.object({
    customerId: z.string().optional(),
    customerName: z.string().min(2, {
        message: "Müşteri adı en az 2 karakter olmalıdır.",
    }),
    customerEmail: z.string().email().optional().or(z.literal("")),
    customerPhone: z.string().optional().refine(val => !val || val.length >= 10, {
        message: "Telefon numarası en az 10 karakter olmalıdır.",
    }),
    items: z.array(z.object({
        productId: z.string(),
        width: z.coerce.number().min(50).max(300),
        height: z.coerce.number().min(150).max(400),
        color: z.string(),
        accessories: z.array(z.string()).optional(),
        quantity: z.coerce.number().min(1),
    })).min(1, { message: "Lütfen siparişe en az bir ürün ekleyin." })
})

export default function NewOrderPage() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("customer")
    const [orderItems, setOrderItems] = useState<any[]>([])
    const [submitting, setSubmitting] = useState(false)
    const [products, setProducts] = useState<Product[]>([])
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loadingProducts, setLoadingProducts] = useState(true)
    // const { toast } = useToast() // Commenting out to avoid error if hook missing

    useEffect(() => {
        loadProducts()
        loadCustomers()
    }, [])

    async function loadProducts() {
        try {
            const data = await fetchProducts()
            setProducts(data)
        } catch (error) {
            console.error("Failed to load products:", error)
        } finally {
            setLoadingProducts(false)
        }
    }

    async function loadCustomers() {
        try {
            const data = await fetchCustomers()
            setCustomers(data)
        } catch (error) {
            console.error("Failed to load customers:", error)
        }
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            customerId: "",
            customerName: "",
            customerEmail: "",
            customerPhone: "",
            items: [],
        },
    })

    const handleCustomerSelect = (customerId: string) => {
        const customer = customers.find(c => c.id === customerId)
        if (customer) {
            form.setValue("customerId", customer.id)
            form.setValue("customerName", customer.name)
            form.setValue("customerEmail", customer.email || "")
            form.setValue("customerPhone", customer.phone || "")
        }
    }

    // Temporary state for the current item being configured
    const [currentItem, setCurrentItem] = useState({
        productId: "",
        width: 90,
        height: 210,
        color: "black",
        accessories: [] as string[],
        quantity: 1,
    })

    const addItem = () => {
        if (!currentItem.productId) return;

        const product = products.find(p => p.id === currentItem.productId);
        const newItem = { ...currentItem, productName: product?.name, price: product?.basePrice || 0 };

        const newItems = [...orderItems, newItem];
        setOrderItems(newItems);
        form.setValue("items", newItems);

        // Reset current item
        setCurrentItem({
            productId: "",
            width: 90,
            height: 210,
            color: "black",
            accessories: [],
            quantity: 1,
        });

        // Move to review tab if it was the first item? No, let user decide.
    }

    const removeItem = (index: number) => {
        const newItems = [...orderItems];
        newItems.splice(index, 1);
        setOrderItems(newItems);
        form.setValue("items", newItems);
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setSubmitting(true)
        try {
            // Prepare data for backend
            const orderData = {
                customerId: values.customerId,
                customerName: values.customerName,
                customerInfo: {
                    email: values.customerEmail,
                    phone: values.customerPhone,
                },
                items: values.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    configuration: {
                        width: item.width,
                        height: item.height,
                        color: item.color,
                        accessories: item.accessories,
                    }
                }))
            }

            await createOrder(orderData)

            // Success - redirect to orders page
            router.push('/dashboard/orders')
        } catch (error) {
            console.error("Failed to create order:", error)
            alert("Sipariş oluşturulamadı. Lütfen tekrar deneyin.")
        } finally {
            setSubmitting(false)
        }
    }

    const calculateTotal = () => {
        return orderItems.reduce((total, item) => {
            let itemTotal = item.price * item.quantity;
            // Add accessory prices
            item.accessories.forEach((accId: string) => {
                const acc = accessories.find(a => a.value === accId);
                if (acc) itemTotal += acc.price * item.quantity;
            });
            return total + itemTotal;
        }, 0);
    }

    return (
        <div className="flex flex-col gap-4 animate-fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Yeni Sipariş Oluştur</h1>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="customer">1. Müşteri Bilgileri</TabsTrigger>
                            <TabsTrigger value="products">2. Ürün Konfigüratörü</TabsTrigger>
                            <TabsTrigger value="review">3. İncele ve Gönder</TabsTrigger>
                        </TabsList>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
                                if (errors.customerName || errors.customerEmail || errors.customerPhone) {
                                    setActiveTab("customer");
                                    alert("Lütfen müşteri bilgilerini kontrol edin.");
                                } else if (errors.items) {
                                    setActiveTab("products");
                                    alert("Lütfen ürün hatalarını kontrol edin.");
                                }
                            })} className="space-y-8 mt-4">

                                <TabsContent value="customer">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Müşteri Detayları</CardTitle>
                                            <CardDescription>
                                                Müşterinin iletişim bilgilerini girin veya kayıtlı müşteri seçin.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <FormLabel>Kayıtlı Müşteri Seç (Opsiyonel)</FormLabel>
                                                    {form.watch("customerId") && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                form.setValue("customerId", "");
                                                                form.setValue("customerName", "");
                                                                form.setValue("customerEmail", "");
                                                                form.setValue("customerPhone", "");
                                                            }}
                                                            className="h-8 text-xs text-muted-foreground hover:text-foreground"
                                                        >
                                                            Seçimi Temizle
                                                        </Button>
                                                    )}
                                                </div>
                                                <Select
                                                    onValueChange={handleCustomerSelect}
                                                    value={form.watch("customerId") || ""}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Müşteri seçin..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {customers.map(c => (
                                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {!form.watch("customerId") && (
                                                    <div className="relative py-2">
                                                        <div className="absolute inset-0 flex items-center">
                                                            <span className="w-full border-t" />
                                                        </div>
                                                        <div className="relative flex justify-center text-xs uppercase">
                                                            <span className="bg-background px-2 text-muted-foreground">
                                                                Veya manuel girin
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="customerName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Ad Soyad / Firma Adı</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Acme Corp"
                                                                {...field}
                                                                disabled={!!form.watch("customerId")}
                                                                className={form.watch("customerId") ? "bg-muted text-muted-foreground" : ""}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="customerEmail"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>E-posta (İsteğe bağlı)</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="contact@acme.com"
                                                                    {...field}
                                                                    disabled={!!form.watch("customerId")}
                                                                    className={form.watch("customerId") ? "bg-muted text-muted-foreground" : ""}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="customerPhone"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Telefon Numarası</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="+1 234 567 890"
                                                                    {...field}
                                                                    disabled={!!form.watch("customerId")}
                                                                    className={form.watch("customerId") ? "bg-muted text-muted-foreground" : ""}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="flex justify-end">
                                                <Button type="button" onClick={() => setActiveTab("products")}>
                                                    İleri: Ürün Ekle
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="products">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Ürün Konfigüratörü</CardTitle>
                                            <CardDescription>
                                                Bir ürün seçin ve özelliklerini özelleştirin.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <FormLabel>Ürün Modeli</FormLabel>
                                                        <Select
                                                            value={currentItem.productId}
                                                            onValueChange={(val) => setCurrentItem({ ...currentItem, productId: val })}
                                                            disabled={loadingProducts}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={loadingProducts ? "Ürünler yükleniyor..." : "Bir ürün seçin"} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {products.map(p => (
                                                                    <SelectItem key={p.id} value={p.id}>{p.name} (${p.basePrice})</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <FormLabel>Genişlik (cm)</FormLabel>
                                                            <Input
                                                                type="number"
                                                                value={currentItem.width}
                                                                onChange={(e) => setCurrentItem({ ...currentItem, width: Number(e.target.value) })}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <FormLabel>Yükseklik (cm)</FormLabel>
                                                            <Input
                                                                type="number"
                                                                value={currentItem.height}
                                                                onChange={(e) => setCurrentItem({ ...currentItem, height: Number(e.target.value) })}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <FormLabel>Renk / Kaplama</FormLabel>
                                                        <Select
                                                            value={currentItem.color}
                                                            onValueChange={(val) => setCurrentItem({ ...currentItem, color: val })}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Renk seçin" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {colors.map(c => (
                                                                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <FormLabel>Adet</FormLabel>
                                                        <Input
                                                            type="number"
                                                            min={1}
                                                            value={currentItem.quantity}
                                                            onChange={(e) => setCurrentItem({ ...currentItem, quantity: Number(e.target.value) })}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <FormLabel>Aksesuarlar</FormLabel>
                                                    <div className="grid gap-2 border rounded-md p-4">
                                                        {accessories.map((acc) => (
                                                            <div key={acc.value} className="flex items-center space-x-2">
                                                                <input
                                                                    type="checkbox"
                                                                    id={acc.value}
                                                                    checked={currentItem.accessories.includes(acc.value)}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            setCurrentItem({ ...currentItem, accessories: [...currentItem.accessories, acc.value] })
                                                                        } else {
                                                                            setCurrentItem({ ...currentItem, accessories: currentItem.accessories.filter(a => a !== acc.value) })
                                                                        }
                                                                    }}
                                                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                                />
                                                                <label htmlFor={acc.value} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1">
                                                                    {acc.label}
                                                                </label>
                                                                <span className="text-sm text-muted-foreground">+${acc.price}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <Button type="button" onClick={addItem} className="w-full" disabled={!currentItem.productId}>
                                                <Plus className="mr-2 h-4 w-4" /> Ürünü Siparişe Ekle
                                            </Button>

                                            {orderItems.length > 0 && (
                                                <div className="flex justify-end mt-4">
                                                    <Button type="button" onClick={() => setActiveTab("review")}>
                                                        İleri: Siparişi İncele
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="review">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Sipariş Özeti</CardTitle>
                                            <CardDescription>
                                                Ürünleri inceleyin ve siparişi tamamlayın.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div className="grid gap-1">
                                                    <h3 className="font-semibold">Müşteri</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {form.getValues("customerName")} <br />
                                                        {form.getValues("customerPhone")} <br />
                                                        {form.getValues("customerEmail")}
                                                    </p>
                                                </div>
                                                <Separator />
                                                <div className="space-y-2">
                                                    <h3 className="font-semibold">Ürünler</h3>
                                                    {orderItems.length === 0 ? (
                                                        <p className="text-sm text-muted-foreground italic">Henüz ürün eklenmedi.</p>
                                                    ) : (
                                                        <div className="grid gap-4">
                                                            {orderItems.map((item, index) => (
                                                                <div key={index} className="flex items-start justify-between border p-3 rounded-md">
                                                                    <div className="grid gap-1">
                                                                        <p className="font-medium">{item.productName} x{item.quantity}</p>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            {item.width}cm x {item.height}cm, {colors.find(c => c.value === item.color)?.label}
                                                                        </p>
                                                                        {item.accessories.length > 0 && (
                                                                            <p className="text-xs text-muted-foreground">
                                                                                + {item.accessories.map((a: string) => accessories.find(acc => acc.value === a)?.label).join(", ")}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-4">
                                                                        {/* Price calculation is simplified here */}
                                                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)}>
                                                                            <Trash className="h-4 w-4 text-red-500" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex justify-between border-t p-6">
                                            <div className="text-lg font-semibold">
                                                Tahmini Toplam: ${calculateTotal().toLocaleString()}
                                            </div>
                                            <Button type="submit" disabled={orderItems.length === 0 || submitting}>
                                                {submitting ? "Gönderiliyor..." : "Siparişi Tamamla"}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </TabsContent>
                            </form>
                        </Form>
                    </Tabs>
                </div>

                {/* Sidebar Summary (Visible on large screens) */}
                <div className="hidden lg:block">
                    <Card className="sticky top-4">
                        <CardHeader>
                            <CardTitle>Mevcut Sipariş</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Ürünler</span>
                                <span>{orderItems.length}</span>
                            </div>
                            <div className="flex items-center justify-between font-semibold">
                                <span>Toplam</span>
                                <span>${calculateTotal().toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
