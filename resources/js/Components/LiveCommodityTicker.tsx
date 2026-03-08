import { useEffect, useState } from 'react';

type Commodity = {
    name: string;
    price: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
    change: number;
};

// Base prices based on 2025/2026 data (Cacao 2800, Café 1700, etc.)
const INITIAL_COMMODITIES: Commodity[] = [
    { name: 'Cacao', price: 2800, unit: 'CFA/kg', trend: 'stable', change: 0 },
    { name: 'Café', price: 1700, unit: 'CFA/kg', trend: 'stable', change: 0 },
    { name: 'Anacarde', price: 450, unit: 'CFA/kg', trend: 'stable', change: 0 },
    { name: 'Coton', price: 350, unit: 'CFA/kg', trend: 'stable', change: 0 },
    { name: 'Hévéa', price: 310, unit: 'CFA/kg', trend: 'stable', change: 0 },
    { name: 'Palmier', price: 95, unit: 'CFA/kg', trend: 'stable', change: 0 },
];

export default function LiveCommodityTicker() {
    const [commodities, setCommodities] = useState<Commodity[]>(INITIAL_COMMODITIES);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const [highlighted, setHighlighted] = useState<number | null>(null);

    useEffect(() => {
        // Simulate live market updates
        const interval = setInterval(() => {
            const index = Math.floor(Math.random() * commodities.length);
            const changePercent = (Math.random() - 0.5) * 0.02; // +/- 1% change
            
            setCommodities((prev) => {
                const next = [...prev];
                const item = { ...next[index] };
                
                // Keep prices somewhat realistic (don't drift too far)
                const basePrice = INITIAL_COMMODITIES[index].price;
                const newPrice = Math.max(basePrice * 0.8, Math.min(basePrice * 1.2, item.price * (1 + changePercent)));
                
                item.price = Math.round(newPrice);
                item.change = newPrice - item.price; // Tracking strict change for trend
                item.trend = changePercent > 0 ? 'up' : 'down';
                
                next[index] = item;
                return next;
            });

            setHighlighted(index);
            setLastUpdate(new Date());

            // Clear highlight after animation
            setTimeout(() => setHighlighted(null), 1000);

        }, 3000); // Update every 3 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-2">
                    <div className="relative flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
                        Marché Live
                    </h3>
                </div>
                <div className="text-[10px] text-muted-foreground">
                    {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
            </div>
            
            <div className="space-y-3">
                {commodities.map((c, i) => (
                    <div 
                        key={c.name} 
                        className={`flex items-center justify-between rounded px-2 py-1.5 transition-colors duration-500 ${
                            highlighted === i 
                                ? c.trend === 'up' 
                                    ? 'bg-green-500/10' 
                                    : 'bg-red-500/10'
                                : 'hover:bg-muted/50'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">{c.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${
                                c.trend === 'up' ? 'text-green-600' : c.trend === 'down' ? 'text-red-600' : ''
                            }`}>
                                {c.price.toLocaleString()} {c.unit}
                            </span>
                            {c.trend === 'up' && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                                    <path d="m5 12 7-7 7 7"/>
                                    <path d="M12 19V5"/>
                                </svg>
                            )}
                            {c.trend === 'down' && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                                    <path d="m19 12-7 7-7-7"/>
                                    <path d="M12 5v14"/>
                                </svg>
                            )}
                            {c.trend === 'stable' && (
                                <div className="w-3" /> // Spacer
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-3 text-center text-[10px] text-muted-foreground">
                Source: Bourse Agricole (Simulé)
            </div>
        </div>
    );
}
