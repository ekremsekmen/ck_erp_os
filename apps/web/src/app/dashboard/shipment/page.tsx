"use client"

import { useState, useEffect } from "react"
import { Search, Filter, MoreHorizontal, FileText, CheckCircle } from "lucide-react"

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
import { ShipmentFormDialog } from "@/components/forms/shipment-form-dialog"
import { fetchShipments, Shipment } from "@/lib/api-client"

export default function ShipmentPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [shipments, setShipments] = useState<Shipment[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadShipments()
    }, [])

    async function loadShipments() {
        setLoading(true)
        try {
            const data = await fetchShipments()
            setShipments(data)
        } catch (error) {
            console.error("Failed to load shipments:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredShipments = shipments.filter(shipment =>
        shipment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.waybillNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )


    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Sevkiyatlar</h1>
                <ShipmentFormDialog onSuccess={loadShipments} />
            </div>
            <Card>
                <CardHeader className="px-7">
                    <CardTitle>Son Sevkiyatlar</CardTitle>
                    <CardDescription>
                        Sevkiyatları takip edin ve irsaliye oluşturun.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Sevkiyat ara..."
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
                            Sevkiyatlar yükleniyor...
                        </div>
                    ) : filteredShipments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Sevkiyat bulunamadı. Oluşturmak için &quot;Sevkiyat Oluştur&quot;a tıklayın.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Sevkiyat No</TableHead>
                                    <TableHead>Sipariş No</TableHead>
                                    <TableHead>İrsaliye No</TableHead>
                                    <TableHead className="hidden sm:table-cell">Sevk Tarihi</TableHead>
                                    <TableHead className="hidden md:table-cell">Taşıyıcı Bilgisi</TableHead>
                                    <TableHead className="text-right">İşlemler</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredShipments.map((shipment) => (
                                    <TableRow key={shipment.id}>
                                        <TableCell className="font-medium">{shipment.id.substring(0, 8)}</TableCell>
                                        <TableCell>{shipment.orderId.substring(0, 8)}</TableCell>
                                        <TableCell className="font-medium">{shipment.waybillNumber}</TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            {new Date(shipment.shippedAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-muted-foreground">
                                            {shipment.carrierInfo || "-"}
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
                                                    <DropdownMenuItem onClick={() => window.open(`http://localhost:3001/shipment/${shipment.id}/waybill`, '_blank')}>
                                                        <FileText className="mr-2 h-4 w-4" /> İrsaliye İndir
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <CheckCircle className="mr-2 h-4 w-4" /> Teslim Edildi Olarak İşaretle
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
