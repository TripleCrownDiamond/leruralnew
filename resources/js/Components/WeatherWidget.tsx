import { useEffect, useState } from 'react';
import { MapPin, Navigation, Search, RotateCcw, Check } from 'lucide-react';

type WeatherData = {
    locationLabel: string;
    temperature: number;
    weathercode: number;
    daily?: { max: number; min: number }[];
};

function codeToLabel(code: number) {
    const map: Record<number, string> = {
        0: 'Ciel dégagé',
        1: 'Principalement clair',
        2: 'Partiellement nuageux',
        3: 'Couvert',
        45: 'Brouillard',
        48: 'Brouillard givrant',
        51: 'Bruine légère',
        53: 'Bruine modérée',
        55: 'Bruine dense',
        61: 'Pluie faible',
        63: 'Pluie modérée',
        65: 'Pluie forte',
        71: 'Neige faible',
        73: 'Neige modérée',
        75: 'Neige forte',
        80: 'Averses faibles',
        81: 'Averses modérées',
        82: 'Averses fortes',
        95: 'Orage',
        96: 'Orage avec grésil',
        99: 'Orage violent',
    };
    return map[code] ?? 'Conditions inconnues';
}

export default function WeatherWidget({
    locationName,
    className,
}: {
    locationName?: string;
    className?: string;
}) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<WeatherData | null>(null);
    const [showInput, setShowInput] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        async function run() {
            try {
                setLoading(true);
                setError(null);

                let lat: number | null = null;
                let lon: number | null = null;
                let label: string | null = locationName ?? null;

                const prefRaw = localStorage.getItem('weather_pref');
                if (prefRaw) {
                    try {
                        const pref = JSON.parse(prefRaw);
                        if (
                            pref?.type === 'geo' &&
                            typeof pref.lat === 'number' &&
                            typeof pref.lon === 'number'
                        ) {
                            lat = pref.lat;
                            lon = pref.lon;
                            label = pref.label ?? label;
                        } else if (
                            pref?.type === 'name' &&
                            typeof pref.name === 'string'
                        ) {
                            label = pref.name;
                            const geo = await fetch(
                                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
                                    pref.name,
                                )}&count=1&language=fr&format=json`,
                            ).then((r) => r.json());
                            if (geo?.results?.[0]) {
                                lat = geo.results[0].latitude;
                                lon = geo.results[0].longitude;
                                label = `${geo.results[0].name}${geo.results[0].country ? ', ' + geo.results[0].country : ''}`;
                            }
                        }
                    } catch {
                        void 0;
                    }
                }

                if ((lat === null || lon === null) && locationName) {
                    const geo = await fetch(
                        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
                            locationName,
                        )}&count=1&language=fr&format=json`,
                    ).then((r) => r.json());
                    if (geo?.results?.[0]) {
                        lat = geo.results[0].latitude;
                        lon = geo.results[0].longitude;
                        label = `${geo.results[0].name}${geo.results[0].country ? ', ' + geo.results[0].country : ''}`;
                    }
                }

                // If geolocation fails or user denies permission, fallback to Cotonou immediately
                // Only try geolocation if no saved preference and no explicit location prop
                if (lat === null || lon === null) {
                    try {
                        await new Promise<void>((resolve, reject) => {
                            if (!navigator.geolocation) return reject();
                            navigator.geolocation.getCurrentPosition(
                                (pos) => {
                                    lat = pos.coords.latitude;
                                    lon = pos.coords.longitude;
                                    resolve();
                                },
                                () => reject(), // User denied or error
                                { timeout: 3000 }
                            );
                        });
                        
                        if (lat !== null && lon !== null) {
                            const rev = await fetch(
                                `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=fr`,
                            ).then((r) => r.json());
                            if (rev?.results?.[0]) {
                                label = `${rev.results[0].name}${rev.results[0].country ? ', ' + rev.results[0].country : ''}`;
                            }
                        }
                    } catch {
                        // Fallback to Cotonou if geolocation fails
                        lat = 6.3654;
                        lon = 2.4183;
                        label = 'Cotonou, Bénin';
                    }
                }

                // Final safety check
                if (lat === null || lon === null) {
                    lat = 6.3654;
                    lon = 2.4183;
                    label = 'Cotonou, Bénin';
                }

                if (!label) {
                    label = 'Localisation inconnue';
                }

                const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
                const w = await fetch(url).then((r) => r.json());
                const daily: { max: number; min: number }[] = Array.isArray(
                    w?.daily?.temperature_2m_max,
                )
                    ? w.daily.temperature_2m_max.map(
                          (mx: number, i: number) => ({
                              max: Math.round(mx),
                              min: Math.round(
                                  w.daily.temperature_2m_min?.[i] ?? mx,
                              ),
                          }),
                      )
                    : [];
                setData({
                    locationLabel: label,
                    temperature: Math.round(w?.current?.temperature_2m ?? 0),
                    weathercode: w?.current?.weathercode ?? 0,
                    daily: daily.slice(0, 3),
                });
            } catch (e) {
                setError('Indisponible');
            } finally {
                setLoading(false);
            }
        }
        run();
    }, [locationName, refreshKey]);

    return (
        <div className={`relative overflow-hidden rounded-3xl border border-gray-200/70 bg-gradient-to-br from-white via-white to-primary/5 dark:border-gray-800 dark:from-gray-900 dark:via-gray-900 dark:to-primary/10 shadow-[0_10px_30px_-15px_rgba(47,106,17,0.15)] ${className ?? ''}`}>
            {/* Decorative glow */}
            <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />

            <div className="relative p-5">
                {/* Editorial header */}
                <div className="mb-5">
                    <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.22em] text-primary mb-3">
                        <span className="inline-block h-2 w-2 rounded-full bg-primary shadow-[0_0_0_4px_rgba(47,106,17,0.15)]" />
                        <span>LE RURAL</span>
                        <span className="h-px w-6 bg-primary/30" />
                        <span className="text-gray-400 dark:text-gray-500">Météo</span>
                    </div>
                    <h3 className="font-heading text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white pb-3">
                        Prévisions
                    </h3>
                </div>

                {loading ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/40 border-t-primary" />
                        <span className="uppercase tracking-wider text-xs font-bold">Chargement…</span>
                    </div>
                ) : error ? (
                    <div className="rounded-2xl bg-red-50 dark:bg-red-950/30 p-3 text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-300">{error}</div>
                ) : data ? (
                    <>
                        {/* Current conditions */}
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-md shadow-primary/20">
                                    <img
                                        src="/meteo.png"
                                        alt="météo"
                                        className="h-7 w-7"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] font-black text-primary mb-0.5">
                                        <MapPin className="h-3 w-3" />
                                        <span className="truncate">{data.locationLabel}</span>
                                    </div>
                                    <div className="font-heading text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white leading-tight truncate">
                                        {codeToLabel(data.weathercode)}
                                    </div>
                                </div>
                            </div>
                            <div className="shrink-0 text-right">
                                <div className="font-heading text-4xl font-black tabular-nums text-primary leading-none">
                                    {data.temperature}°
                                </div>
                                <div className="mt-1 text-[9px] uppercase tracking-[0.16em] font-black text-gray-400 dark:text-gray-500">
                                    Celsius
                                </div>
                            </div>
                        </div>

                        {/* 3-day forecast */}
                        {data.daily && data.daily.length > 0 ? (
                            <div className="mt-5 grid grid-cols-3 gap-2">
                                {data.daily.map((d, i) => (
                                    <div
                                        key={i}
                                        className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 p-3 text-center"
                                    >
                                        <div className="text-[9px] font-black uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500 mb-1">
                                            J+{i}
                                        </div>
                                        <div className="font-heading text-lg font-black tabular-nums text-primary leading-none">
                                            {d.max}°
                                        </div>
                                        <div className="mt-1 text-[10px] font-bold tabular-nums text-gray-500 dark:text-gray-400">
                                            min {d.min}°
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : null}

                        {/* Controls */}
                        <div className="mt-5 flex items-center justify-start gap-2 border-t border-dashed border-gray-200 dark:border-gray-800 pt-4">
                            <button
                                type="button"
                                title="Utiliser ma position"
                                className="group inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all hover:bg-primary hover:text-white hover:scale-105"
                                onClick={() => {
                                    if (!navigator.geolocation) return;
                                    navigator.geolocation.getCurrentPosition(
                                        (pos) => {
                                            const lat = pos.coords.latitude;
                                            const lon = pos.coords.longitude;
                                            try {
                                                localStorage.setItem(
                                                    'weather_pref',
                                                    JSON.stringify({
                                                        type: 'geo',
                                                        lat,
                                                        lon,
                                                        label: 'Ma position',
                                                    }),
                                                );
                                            } catch {
                                                void 0;
                                            }
                                            setRefreshKey((k) => k + 1);
                                        },
                                    );
                                }}
                            >
                                <Navigation className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                title="Saisir une ville"
                                className="group inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all hover:bg-primary hover:text-white hover:scale-105"
                                onClick={() => setShowInput((v) => !v)}
                            >
                                <Search className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                title="Réinitialiser"
                                className="group inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 transition-all hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 hover:scale-105"
                                onClick={() => {
                                    try {
                                        localStorage.removeItem('weather_pref');
                                    } catch {
                                        void 0;
                                    }
                                    setRefreshKey((k) => k + 1);
                                }}
                            >
                                <RotateCcw className="h-4 w-4" />
                            </button>
                        </div>

                        {showInput ? (
                            <div className="mt-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                <input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    className="h-10 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                    placeholder="Ville, pays"
                                />
                                <button
                                    type="button"
                                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-primary to-primary/85 text-white hover:opacity-90 shadow-md shadow-primary/20"
                                    onClick={() => {
                                        if (!inputValue.trim()) return;
                                        try {
                                            localStorage.setItem(
                                                'weather_pref',
                                                JSON.stringify({
                                                    type: 'name',
                                                    name: inputValue.trim(),
                                                }),
                                            );
                                        } catch {
                                            void 0;
                                        }
                                        setShowInput(false);
                                        setRefreshKey((k) => k + 1);
                                    }}
                                >
                                    <Check className="h-4 w-4" />
                                </button>
                            </div>
                        ) : null}
                    </>
                ) : null}
            </div>
        </div>
    );
}
