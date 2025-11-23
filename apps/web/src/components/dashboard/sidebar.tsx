"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Bell,
    Home,
    LineChart,
    Package,
    Package2,
    ShoppingCart,
    Users,
    Factory,
    Truck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { OrderCountBadge } from "@/components/dashboard/order-count-badge"
import { cn } from "@/lib/utils"

export function Sidebar() {
    const pathname = usePathname()

    const links = [
        {
            href: "/dashboard",
            label: "Panel",
            icon: Home,
        },
        {
            href: "/dashboard/orders",
            label: "Siparişler",
            icon: ShoppingCart,
            badge: <OrderCountBadge />,
        },
        {
            href: "/dashboard/products",
            label: "Ürünler",
            icon: Package,
        },
        {
            href: "/dashboard/production",
            label: "Üretim",
            icon: Factory,
        },
        {
            href: "/dashboard/stock",
            label: "Stok",
            icon: LineChart,
        },
        {
            href: "/dashboard/shipment",
            label: "Sevkiyat",
            icon: Truck,
        },
        {
            href: "/dashboard/users",
            label: "Kullanıcılar",
            icon: Users,
        },
        {
            href: "/dashboard/customers",
            label: "Müşteriler",
            icon: Users,
        },
        {
            href: "/dashboard/bi",
            label: "İş Zekası",
            icon: LineChart,
        },
    ]

    return (
        <div className="hidden border-r bg-muted/40 md:block h-full">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 bg-white/50 backdrop-blur-sm">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <div className="p-1 bg-primary rounded-md text-primary-foreground">
                            <Package2 className="h-5 w-5" />
                        </div>
                        <span className="text-lg tracking-tight">AtölyeOS</span>
                    </Link>
                    <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 text-muted-foreground hover:text-primary">
                        <Bell className="h-4 w-4" />
                        <span className="sr-only">Toggle notifications</span>
                    </Button>
                </div>
                <div className="flex-1 overflow-auto py-2">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
                        {links.map((link) => {
                            const isActive = pathname === link.href
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                            : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                                    )}
                                >
                                    <link.icon className="h-4 w-4" />
                                    {link.label}
                                    {link.badge && <div className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">{link.badge}</div>}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

            </div>
        </div>
    )
}
