"use client"

import { useState, useEffect } from "react"
import { Search, Filter, MoreHorizontal, Edit, Trash, Plus } from "lucide-react"

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
import { Badge } from "@/components/ui/badge"
import { MaterialFormDialog } from "@/components/forms/material-form-dialog"
import { AddStockDialog } from "@/components/forms/add-stock-dialog"
import { fetchMaterials, deleteMaterial, Material } from "@/lib/api-client"

export default function StockPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [materials, setMaterials] = useState<Material[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadMaterials()
    }, [])

    async function loadMaterials() {
        setLoading(true)
        try {
            const data = await fetchMaterials()
            setMaterials(data)
        } catch (error) {
            console.error("Failed to load materials:", error)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Bu malzemeyi silmek istediğinize emin misiniz?")) return

        try {
            await deleteMaterial(id)
            await loadMaterials()
        } catch (error) {
            console.error("Failed to delete material:", error)
            alert("Malzeme silinemedi. Lütfen tekrar deneyin.")
        }
    }

    const filteredStock = materials.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStockStatus = (current: number, min: number) => {
        if (current === 0) return "Stokta Yok"
        if (current <= min) return "Düşük Stok"
        return "Stokta Var"
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Stok Yönetimi</h1>
                <MaterialFormDialog onSuccess={loadMaterials} />
            </div>
            <Card>
                <CardHeader className="px-7">
                    <CardTitle>Envanter</CardTitle>
                    <CardDescription>
                        Hammadde ve bileşen envanterinizi yönetin.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Malzeme ara..."
                                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon">
                            <Filter className="h-4 w-4" />
                            <span className="sr-only">Filter</span>
                        </Button>
                    </div>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Malzemeler yükleniyor...
                        </div>
                    ) : filteredStock.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Malzeme bulunamadı. Oluşturmak için &quot;Malzeme Ekle&quot;ye tıklayın.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>İsim</TableHead>
                                    <TableHead className="hidden sm:table-cell">Birim</TableHead>
                                    <TableHead className="hidden sm:table-cell">Durum</TableHead>
                                    <TableHead className="text-right">Stok Seviyesi</TableHead>
                                    <TableHead className="hidden md:table-cell text-right">Birim Fiyat</TableHead>
                                    <TableHead className="text-right">İşlemler</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStock.map((item) => {
                                    const status = getStockStatus(item.currentStock, item.minStockLevel)
                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="font-medium">{item.name}</div>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                {item.unit}
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                <Badge className="text-xs" variant={
                                                    status === "Stokta Yok" ? "destructive" :
                                                        status === "Düşük Stok" ? "secondary" :
                                                            "outline"
                                                }>
                                                    {status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className={`font-medium ${item.currentStock <= item.minStockLevel ? "text-red-500" : ""}`}>
                                                    {item.currentStock}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Min: {item.minStockLevel}
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-right">
                                                {item.currency} {item.unitPrice.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Toggle menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                                                        <MaterialFormDialog
                                                            material={item}
                                                            onSuccess={loadMaterials}
                                                            trigger={
                                                                <DropdownMenuItem
                                                                    className="focus:bg-primary/10 cursor-pointer"
                                                                    onSelect={(e) => e.preventDefault()}
                                                                >
                                                                    <Edit className="mr-2 h-4 w-4" /> Düzenle
                                                                </DropdownMenuItem>
                                                            }
                                                        />
                                                        <AddStockDialog
                                                            material={item}
                                                            onSuccess={loadMaterials}
                                                            trigger={
                                                                <DropdownMenuItem
                                                                    className="focus:bg-primary/10 cursor-pointer"
                                                                    onSelect={(e) => e.preventDefault()}
                                                                >
                                                                    <Plus className="mr-2 h-4 w-4" /> Stok Ekle
                                                                </DropdownMenuItem>
                                                            }
                                                        />
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() => handleDelete(item.id)}
                                                        >
                                                            <Trash className="mr-2 h-4 w-4" /> Sil
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
