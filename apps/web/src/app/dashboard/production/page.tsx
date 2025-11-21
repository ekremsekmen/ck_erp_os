"use client"

import { useState, useEffect } from "react"
import { ArrowRight, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { fetchProduction, updateProductionStage } from "@/lib/api-client"

// Mock Data

const stages = [
    "CUTTING_BENDING",
    "WELDING_GRINDING",
    "PAINTING_WASHING",
    "ASSEMBLY_PACKAGING",
    "READY_FOR_SHIPMENT"
]

const stageNames: Record<string, string> = {
    "CUTTING_BENDING": "Kesim & Büküm",
    "WELDING_GRINDING": "Kaynak & Taşlama",
    "PAINTING_WASHING": "Boya & Yıkama",
    "ASSEMBLY_PACKAGING": "Montaj & Paketleme",
    "READY_FOR_SHIPMENT": "Sevkiyata Hazır"
}

export default function ProductionPage() {
    const [tasks, setTasks] = useState<{
        id: string;
        orderId: string;
        displayId: string;
        customer: string;
        items: any[]; // Keeping items as any[] for now as structure is complex, but better than whole array as any
        stage: string;
        date: string;
    }[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadTasks()
    }, [])

    async function loadTasks() {
        setLoading(true)
        try {
            const data = await fetchProduction()
            // Transform API data to match UI expected format if needed, or adjust UI
            // API returns ProductionTracking objects. 
            // We need to map them to the UI structure or update UI to use API structure.
            // Let's map for now to keep UI changes minimal.
            const mappedTasks = data.map(t => ({
                id: t.id,
                orderId: t.orderId, // Keep real order ID
                displayId: t.orderId.substring(0, 8),
                customer: t.order.customerName,
                items: t.order.items,
                stage: t.currentStage,
                date: new Date(t.startedAt).toLocaleDateString()
            }))
            setTasks(mappedTasks)
        } catch (error) {
            console.error("Failed to load production tasks:", error)
        } finally {
            setLoading(false)
        }
    }

    const moveTask = async (taskId: string, currentStage: string) => {
        const currentIndex = stages.indexOf(currentStage);
        if (currentIndex < stages.length - 1) {
            const nextStage = stages[currentIndex + 1];
            try {
                await updateProductionStage(taskId, nextStage);
                // Optimistic update or reload
                loadTasks();
            } catch (error) {
                console.error("Failed to update stage:", error);
                alert("Aşama güncellenemedi.");
            }
        }
    }

    return (
        <div className="flex flex-col gap-4 h-[calc(100vh-120px)]">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Üretim Takibi</h1>
            </div>

            <ScrollArea className="h-full w-full whitespace-nowrap rounded-md border">
                <div className="flex w-max space-x-4 p-4">
                    {stages.map((stage) => (
                        <div key={stage} className="w-[300px] flex-shrink-0 flex flex-col gap-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="font-semibold">{stageNames[stage]}</h3>
                                <Badge variant="secondary">
                                    {tasks.filter(t => t.stage === stage).length}
                                </Badge>
                            </div>
                            <div className="flex flex-col gap-3 bg-muted/50 p-2 rounded-lg min-h-[500px]">
                                {tasks.filter(t => t.stage === stage).map(task => (
                                    <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow">
                                        <CardHeader className="p-4 pb-2">
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-sm font-medium">{task.displayId}</CardTitle>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                                            <MoreHorizontal className="h-3 w-3" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>Detayları Gör</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600">Sorun Bildir</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            <CardDescription className="text-xs">{task.customer}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-2">
                                            <div className="space-y-2">
                                                {task.items.map((item: any, idx: number) => (
                                                    <div key={idx} className="text-sm">
                                                        <p className="font-medium">{item.product.name}</p>
                                                        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                                                            {(() => {
                                                                try {
                                                                    const config = typeof item.configuration === 'string'
                                                                        ? JSON.parse(item.configuration)
                                                                        : item.configuration;

                                                                    if (!config) return null;

                                                                    return (
                                                                        <>
                                                                            <p>Ölçüler: {config.width}x{config.height} cm</p>
                                                                            <p>Renk: {config.color}</p>
                                                                            {config.accessories && config.accessories.length > 0 && (
                                                                                <p>Aksesuarlar: {config.accessories.length} adet</p>
                                                                            )}
                                                                        </>
                                                                    );
                                                                } catch {
                                                                    return null;
                                                                }
                                                            })()}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-3 pt-2 border-t">{task.date}</p>
                                        </CardContent>
                                        {stage !== "Sevkiyata Hazır" && (
                                            <CardFooter className="p-2 pt-0">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-full text-xs h-7"
                                                    onClick={() => moveTask(task.id, task.stage)}
                                                >
                                                    Sonraki Aşama <ArrowRight className="ml-1 h-3 w-3" />
                                                </Button>
                                            </CardFooter>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                    Loading...
                </div>
            )}
        </div>
    )
}
