import { useEffect, useRef, useState } from 'react';

// Official Prices 2025/2026 (Fixed)
const OFFICIAL_PRICES = [
    { name: 'Cacao (CI)', price: '2 800', unit: 'FCFA/kg', note: 'Campagne 2025-2026' },
    { name: 'Café (CI)', price: '1 700', unit: 'FCFA/kg', note: 'Campagne 2025-2026' },
    { name: 'Anacarde (CI)', price: '425', unit: 'FCFA/kg', note: 'Campagne 2025' },
    { name: 'Anacarde (BF)', price: '385', unit: 'FCFA/kg', note: 'Campagne 2025' },
    { name: 'Anacarde (BJ)', price: '375', unit: 'FCFA/kg', note: 'Campagne 2025' },
    { name: 'Coton (CI)', price: '310', unit: 'FCFA/kg', note: '1er choix' },
];

export default function MarketWidget({
    marketPrices,
}: {
    marketPrices?: {
        name: string;
        price: string;
        unit: string;
        note: string | null;
    }[];
}) {
    const [activeTab, setActiveTab] = useState<'international' | 'local'>('international');
    const containerRef = useRef<HTMLDivElement>(null);
    const localPrices = marketPrices ?? OFFICIAL_PRICES;

    // Helper to extract country and format name
    const formatPriceItem = (name: string) => {
        const match = name.match(/(.*)\s\((.*)\)$/);
        if (match) {
            return { name: match[1], country: match[2] };
        }
        return { name, country: null };
    };

    // Helper to get flag emoji
    const getFlag = (countryCode: string | null) => {
        switch (countryCode) {
            case 'CI': return '🇨🇮';
            case 'BF': return '🇧🇫';
            case 'BJ': return '🇧🇯';
            case 'TG': return '🇹🇬';
            case 'SN': return '🇸🇳';
            default: return '';
        }
    };

    useEffect(() => {
        // Only run if international tab is active AND container exists
        if (activeTab === 'international' && containerRef.current) {
            // Clean previous widget if any
            containerRef.current.innerHTML = '';
            
            // Create a wrapper div inside the ref to hold the widget
            const widgetContainer = document.createElement('div');
            widgetContainer.className = 'tradingview-widget-container__widget';
            containerRef.current.appendChild(widgetContainer);

            const script = document.createElement('script');
            script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
            script.async = true;
            script.innerHTML = JSON.stringify({
                colorTheme: 'light',
                dateRange: '12M',
                showChart: false,
                locale: 'fr',
                largeChartUrl: '',
                isTransparent: true,
                showSymbolLogo: true,
                showFloatingTooltip: false,
                width: '100%',
                height: '350',
                plotLineColorGrowing: 'rgba(34, 197, 94, 1)',
                plotLineColorFalling: 'rgba(239, 68, 68, 1)',
                gridLineColor: 'rgba(240, 243, 250, 0)',
                scaleFontColor: 'rgba(120, 123, 134, 1)',
                belowLineFillColorGrowing: 'rgba(34, 197, 94, 0.12)',
                belowLineFillColorFalling: 'rgba(239, 68, 68, 0.12)',
                belowLineFillColorGrowingBottom: 'rgba(34, 197, 94, 0)',
                belowLineFillColorFallingBottom: 'rgba(239, 68, 68, 0)',
                symbolActiveColor: 'rgba(33, 150, 243, 0.12)',
                tabs: [
                    {
                        title: 'Matières Premières',
                        symbols: [
                            {
                                s: 'ICEUS:CC1!',
                                d: 'Cacao (NY)',
                            },
                            {
                                s: 'ICEUS:KC1!',
                                d: 'Café Arabica',
                            },
                            {
                                s: 'ICEEU:RC1!',
                                d: 'Café Robusta',
                            },
                            {
                                s: 'ICEUS:CT1!',
                                d: 'Coton',
                            },
                            {
                                s: 'CBOT:ZO1!',
                                d: 'Avoine',
                            },
                            {
                                s: 'CBOT:ZR1!',
                                d: 'Riz',
                            },
                        ],
                        originalTitle: 'Commodities',
                    },
                ],
            });
            containerRef.current.appendChild(script);
        }
    }, [activeTab]);

    return (
        <div className="overflow-hidden rounded-lg border bg-card">
            <div className="flex border-b">
                <button
                    className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                        activeTab === 'international'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    }`}
                    onClick={() => setActiveTab('international')}
                >
                    Cours Mondiaux
                </button>
                <button
                    className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                        activeTab === 'local'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    }`}
                    onClick={() => setActiveTab('local')}
                >
                    Bord Champ (CI)
                </button>
            </div>

            <div className="p-4">
                {activeTab === 'international' ? (
                    <div className="min-h-[350px]">
                        <div ref={containerRef} className="tradingview-widget-container h-[350px] w-full">
                            {/* Widget will be injected here */}
                        </div>
                        <div className="mt-2 text-center text-[10px] text-muted-foreground">
                            Données live via TradingView
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                         <div className="mb-3 flex items-center gap-2 border-b border-border pb-2">
                            <div className="h-4 w-1 rounded-full bg-primary" />
                            <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
                                Prix Officiels
                            </h3>
                        </div>
                        {localPrices.map((item) => {
                            const { name, country } = formatPriceItem(item.name);
                            const flag = getFlag(country);
                            
                            return (
                                <div
                                    key={item.name}
                                    className="flex items-center justify-between rounded bg-muted/30 px-3 py-2"
                                >
                                    <div className="flex items-start gap-2">
                                        {flag && <span className="text-lg">{flag}</span>}
                                        <div>
                                            <div className="font-semibold text-foreground">
                                                {name}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">
                                                {item.note}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-primary">
                                            {item.price}
                                        </div>
                                        <div className="text-[10px] font-medium text-muted-foreground">
                                            {item.unit}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div className="mt-4 rounded bg-amber-500/10 p-2 text-[10px] leading-tight text-amber-700">
                            <strong>Note:</strong> Ces prix sont fixés par le Conseil Café-Cacao / CCA pour la campagne en cours.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
