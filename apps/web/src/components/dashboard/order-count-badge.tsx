"use client"

import { useState, useEffect } from "react"
import { fetchOrders } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"

export function OrderCountBadge() {
    const [count, setCount] = useState<number | null>(null)

    useEffect(() => {
        async function loadCount() {
            try {
                const orders = await fetchOrders()
                // Count pending orders
                const pendingCount = orders.filter(o => o.status === 'PENDING').length
                setCount(pendingCount)
            } catch (error) {
                console.error("Failed to load order count", error)
            }
        }

        loadCount()

        // Optional: Poll every minute
        const interval = setInterval(loadCount, 60000)
        return () => clearInterval(interval)
    }, [])

    if (count === null || count === 0) return null

    return (
        <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
            {count}
        </Badge>
    )
}
