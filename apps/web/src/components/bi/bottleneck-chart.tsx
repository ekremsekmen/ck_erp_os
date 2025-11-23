'use client';

import { useEffect, useState } from 'react';
import { fetchBottlenecks, BottleneckAnalysis } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const STAGE_NAMES: Record<string, string> = {
    'CUTTING_BENDING': 'Kesim & Büküm',
    'WELDING_GRINDING': 'Kaynak & Tesviye',
    'PAINTING_WASHING': 'Boya & Yıkama',
    'ASSEMBLY_PACKAGING': 'Montaj & Paketleme',
    'COMPLETED': 'Tamamlandı'
};

export function BottleneckChart({ className }: { className?: string }) {
    const [data, setData] = useState<BottleneckAnalysis | null>(null);

    useEffect(() => {
        fetchBottlenecks().then(setData);
    }, []);

    if (!data) return <div className="h-full flex items-center justify-center text-muted-foreground">Yükleniyor...</div>;

    return (
        <Card className={`shadow-sm border-0 bg-white/50 backdrop-blur-sm ${className}`}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Üretim Darboğazları</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
                {/* Stage Benchmarks - Grid Layout */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {data.stageBenchmarks.map((stage) => {
                        const maxDuration = Math.max(...data.stageBenchmarks.map(s => s.averageDurationHours));
                        const percentage = (stage.averageDurationHours / maxDuration) * 100;
                        return (
                            <div key={stage.stage} className="bg-muted/30 p-4 rounded-lg border">
                                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground truncate" title={STAGE_NAMES[stage.stage]}>
                                    {STAGE_NAMES[stage.stage] || stage.stage}
                                </div>
                                <div className="mt-2 flex items-baseline gap-1">
                                    <span className="text-2xl font-bold">{stage.averageDurationHours}s</span>
                                    <span className="text-xs text-muted-foreground">ort.</span>
                                </div>
                                <div className="mt-3 h-2 w-full bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${stage.averageDurationHours > 8 ? 'bg-orange-500' : 'bg-blue-500'}`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Active Delays - List */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        Aktif Gecikmeler
                    </h3>
                    <div className="space-y-3">
                        {data.activeDelays.length > 0 ? (
                            data.activeDelays.map((delay) => (
                                <div key={delay.orderId} className="flex items-center justify-between p-4 bg-white border rounded-md shadow-sm">
                                    <div>
                                        <div className="font-medium">#{delay.orderId.slice(0, 8)}</div>
                                        <div className="text-sm text-muted-foreground mt-1">
                                            <span className="font-medium text-foreground">{STAGE_NAMES[delay.stage] || delay.stage}</span> • {delay.elapsedHours} saattir bekliyor
                                        </div>
                                    </div>
                                    <span className="ml-4 shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        +{Math.round(delay.elapsedHours - delay.averageExpected)}s Gecikme
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center text-muted-foreground p-8 border border-dashed rounded-md bg-muted/10">
                                <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                                <p className="text-sm font-medium">Her şey yolunda</p>
                                <p className="text-xs">Geciken sipariş yok</p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
