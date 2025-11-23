"use client"

import Link from "next/link"
import { logout } from "@/lib/api-client"
import {
    CircleUser,
    Home,
    LineChart,
    Menu,
    Package,
    Package2,
    Search,
    ShoppingCart,
    Users,
    Factory,
    Truck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { OrderCountBadge } from "@/components/dashboard/order-count-badge"
import { Sidebar } from "@/components/dashboard/sidebar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] bg-muted/30">
            <Sidebar />
            <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-white/50 backdrop-blur-sm px-4 lg:h-[60px] lg:px-6 sticky top-0 z-10">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="shrink-0 md:hidden"
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col">
                            <nav className="grid gap-2 text-lg font-medium">
                                <Link
                                    href="#"
                                    className="flex items-center gap-2 text-lg font-semibold"
                                >
                                    <div className="p-1 bg-primary rounded-md text-primary-foreground">
                                        <Package2 className="h-6 w-6" />
                                    </div>
                                    <span className="sr-only">AtölyeOS</span>
                                </Link>
                                <Link
                                    href="/dashboard"
                                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                                >
                                    <Home className="h-5 w-5" />
                                    Panel
                                </Link>
                                <Link
                                    href="/dashboard/orders"
                                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-muted px-3 py-2 text-foreground hover:text-foreground"
                                >
                                    <ShoppingCart className="h-5 w-5" />
                                    Siparişler
                                    <OrderCountBadge />
                                </Link>
                                <Link
                                    href="/dashboard/products"
                                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                                >
                                    <Package className="h-5 w-5" />
                                    Ürünler
                                </Link>
                                <Link
                                    href="/dashboard/production"
                                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                                >
                                    <Factory className="h-5 w-5" />
                                    Üretim
                                </Link>
                                <Link
                                    href="/dashboard/stock"
                                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                                >
                                    <LineChart className="h-5 w-5" />
                                    Stok
                                </Link>
                                <Link
                                    href="/dashboard/shipment"
                                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                                >
                                    <Truck className="h-5 w-5" />
                                    Sevkiyat
                                </Link>
                                <Link
                                    href="/dashboard/users"
                                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                                >
                                    <Users className="h-5 w-5" />
                                    Kullanıcılar
                                </Link>
                                <Link
                                    href="/dashboard/customers"
                                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                                >
                                    <Users className="h-5 w-5" />
                                    Müşteriler
                                </Link>
                            </nav>

                        </SheetContent>
                    </Sheet>
                    <div className="w-full flex-1">
                        <form>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Ürün ara..."
                                    className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3 focus-visible:ring-primary"
                                />
                            </div>
                        </form>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="rounded-full shadow-sm">
                                <CircleUser className="h-5 w-5" />
                                <span className="sr-only">Toggle user menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Ayarlar</DropdownMenuItem>
                            <DropdownMenuItem>Destek</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={logout} className="cursor-pointer">Çıkış Yap</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
