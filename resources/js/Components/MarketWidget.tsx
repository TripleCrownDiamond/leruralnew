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
        <div className="relative overflow-hidden rounded-3xl border border-gray-200/70 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-[0_10px_30px_-15px_rgba(47,106,17,0.15)]">
            {/* Editorial header — matches WidgetShell pattern */}
            <div className="px-5 pt-5 pb-4">
                <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.22em] text-primary mb-3">
                    <span className="inline-block h-2 w-2 rounded-full bg-primary shadow-[0_0_0_4px_rgba(47,106,17,0.15)]" />
                    <span>LE RURAL</span>
                    <span className="h-px w-6 bg-primary/30" />
                    <span className="text-gray-400 dark:text-gray-500">Marchés</span>
                </div>
                <h3 className="font-heading text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white leading-tight border-b-2 border-gray-900 dark:border-white pb-3">
                    Cours des matières premières
                </h3>
            </div>

            {/* Tab switcher — editorial pills */}
            <div className="flex gap-1.5 p-3 bg-gray-50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800">
                <button
                    className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-[0.14em] rounded-full transition-all ${
                        activeTab === 'international'
                            ? 'bg-gradient-to-r from-primary to-primary/85 text-white shadow-md shadow-primary/20'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    onClick={() => setActiveTab('international')}
                >
                    Cours Mondiaux
                </button>
                <button
                    className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-[0.14em] rounded-full transition-all ${
                        activeTab === 'local'
                            ? 'bg-gradient-to-r from-primary to-primary/85 text-white shadow-md shadow-primary/20'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    onClick={() => setActiveTab('local')}
                >
                    Bord Champ
                </button>
            </div>

            <div className="p-5">
                {activeTab === 'international' ? (
                    <div className="min-h-[350px]">
                        <div ref={containerRef} className="tradingview-widget-container h-[350px] w-full">
                            {/* Widget injected */}
                        </div>
                        <div className="mt-3 text-center text-[9px] font-black uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
                            Live · TradingView
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        <div className="flex items-center gap-2 pb-1">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                                Prix Officiels
                            </h4>
                            <span className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                        </div>

                        {localPrices.map((item) => {
                            const { name, country } = formatPriceItem(item.name);
                            const flag = getFlag(country);

                            return (
                                <div
                                    key={item.name}
                                    className="group flex items-center justify-between rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 px-4 py-3 hover:border-primary/40 hover:bg-primary/5 transition-all"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        {flag && <span className="text-xl shrink-0">{flag}</span>}
                                        <div className="min-w-0">
                                            <div className="font-heading text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white truncate">
                                                {name}
                                            </div>
                                            <div className="text-[9px] uppercase tracking-[0.14em] font-bold text-gray-400 dark:text-gray-500 truncate">
                                                {item.note}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0 ml-3">
                                        <div className="font-heading text-lg font-black tabular-nums text-primary leading-none">
                                            {item.price}
                                        </div>
                                        <div className="mt-1 text-[9px] uppercase tracking-[0.14em] font-black text-gray-500 dark:text-gray-400">
                                            {item.unit}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        <div className="mt-4 flex gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-[10px] leading-relaxed text-amber-800 dark:text-amber-200">
                            <span className="shrink-0 inline-block h-4 w-4 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center">i</span>
                            <span>
                                <strong className="font-black uppercase tracking-wider text-[9px] block mb-0.5">Note officielle</strong>
                                Prix fixés par le Conseil Café-Cacao / CCA pour la campagne en cours.
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
