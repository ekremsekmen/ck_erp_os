"use client"

import { useState, useEffect } from "react"
import { Search, Filter, MoreHorizontal, Edit, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ProductFormDialog } from "@/components/forms/product-form-dialog"
import { fetchProducts, deleteProduct, Product } from "@/lib/api-client"

export default function ProductsPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadProducts()
    }, [])

    async function loadProducts() {
        setLoading(true)
        try {
            const data = await fetchProducts()
            setProducts(data)
        } catch (error) {
            console.error("Failed to load products:", error)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return

        try {
            await deleteProduct(id)
            await loadProducts()
        } catch (error) {
            console.error("Failed to delete product:", error)
            alert("Ürün silinemedi. Lütfen tekrar deneyin.")
        }
    }

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.id.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="flex flex-col gap-4 animate-fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Ürünler</h1>
                <ProductFormDialog onSuccess={loadProducts} />
            </div>
            <Card className="glass border-none shadow-md">
                <CardHeader className="px-7">
                    <CardTitle>Ürün Kataloğu</CardTitle>
                    <CardDescription>
                        Ürün kataloğunuzu ve taban fiyatlarınızı yönetin.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Ürün ara..."
                                className="pl-9 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-white/50 border-none shadow-sm focus-visible:ring-primary"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon" className="bg-white/50 border-none shadow-sm hover:bg-white/80">
                            <Filter className="h-4 w-4" />
                            <span className="sr-only">Filter</span>
                        </Button>
                    </div>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Ürünler yükleniyor...
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Ürün bulunamadı. Oluşturmak için &quot;Ürün Ekle&quot;ye tıklayın.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b-primary/10">
                                    <TableHead className="font-semibold text-primary">Ürün No</TableHead>
                                    <TableHead className="font-semibold text-primary">İsim</TableHead>
                                    <TableHead className="hidden md:table-cell font-semibold text-primary">Açıklama</TableHead>
                                    <TableHead className="hidden sm:table-cell font-semibold text-primary">Son Güncelleme</TableHead>
                                    <TableHead className="text-right font-semibold text-primary">Taban Fiyat</TableHead>
                                    <TableHead className="text-right font-semibold text-primary">İşlemler</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.map((product) => (
                                    <TableRow key={product.id} className="hover:bg-primary/5 border-b-primary/5 transition-colors">
                                        <TableCell className="font-medium">{product.id.substring(0, 8)}</TableCell>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell className="hidden md:table-cell text-muted-foreground">
                                            {product.description || "-"}
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            {new Date(product.updatedAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            ${product.basePrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost" className="hover:bg-primary/10">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Toggle menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="glass border-none shadow-lg">
                                                    <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                                                    <DropdownMenuItem className="focus:bg-primary/10 cursor-pointer">
                                                        <Edit className="mr-2 h-4 w-4" /> Düzenle
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer"
                                                        onClick={() => handleDelete(product.id)}
                                                    >
                                                        <Trash className="mr-2 h-4 w-4" /> Sil
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
