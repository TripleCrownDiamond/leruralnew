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
        <div className={`rounded-lg border bg-card p-4 ${className ?? ''}`}>
            <div className="mb-4 flex items-center gap-2 border-b border-border pb-2">
                <div className="h-4 w-1 rounded-full bg-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
                    Météo
                </h3>
            </div>
            {loading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/40 border-t-transparent" />
                    Chargement…
                </div>
            ) : error ? (
                <div className="text-sm text-muted-foreground">{error}</div>
            ) : data ? (
                <>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img
                                src="/meteo.png"
                                alt="météo"
                                className="h-7 w-7 shrink-0"
                                loading="lazy"
                            />
                            <div>
                                <div className="text-sm font-semibold">
                                    {data.locationLabel}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {codeToLabel(data.weathercode)}
                                </div>
                            </div>
                        </div>
                        <div className="text-xl font-bold text-primary">
                            {data.temperature}°C
                        </div>
                    </div>
                    {data.daily && data.daily.length > 0 ? (
                        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                            {data.daily.map((d, i) => (
                                <div
                                    key={i}
                                    className="rounded border bg-muted/30 p-2 text-center"
                                >
                                    <div className="font-semibold">J+{i}</div>
                                    <div>
                                        <span className="font-semibold text-primary">
                                            {d.max}°
                                        </span>{' '}
                                        / {d.min}°
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : null}
                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
                        <button
                            type="button"
                            title="Utiliser ma position"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
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
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
                            onClick={() => setShowInput((v) => !v)}
                        >
                            <Search className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            title="Réinitialiser"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
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
                                className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Ville, pays"
                            />
                            <button
                                type="button"
                                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-white hover:bg-primary/90"
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
    );
}
