import TextInput from '@/Components/TextInput';

interface CoverPositionControlProps {
    imageUrl?: string | null;
    x: number;
    y: number;
    onChangeX: (value: number) => void;
    onChangeY: (value: number) => void;
    recommendation: string;
}

export default function CoverPositionControl({
    imageUrl,
    x,
    y,
    onChangeX,
    onChangeY,
    recommendation,
}: CoverPositionControlProps) {
    const safeX = Number.isFinite(x) ? Math.min(100, Math.max(0, x)) : 50;
    const safeY = Number.isFinite(y) ? Math.min(100, Math.max(0, y)) : 50;

    return (
        <div className="mt-4 space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <div>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">Cadrage cover</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-white/60">{recommendation}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                    <span className="text-xs font-semibold text-gray-700 dark:text-white/80">Position horizontale ({safeX}%)</span>
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={safeX}
                        onChange={(event) => onChangeX(Number(event.target.value))}
                        className="w-full accent-primary"
                    />
                </label>

                <label className="space-y-2">
                    <span className="text-xs font-semibold text-gray-700 dark:text-white/80">Position verticale ({safeY}%)</span>
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={safeY}
                        onChange={(event) => onChangeY(Number(event.target.value))}
                        className="w-full accent-primary"
                    />
                </label>
            </div>

            <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => { onChangeX(50); onChangeY(50); }} className="rounded-full border border-gray-300 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-gray-700 dark:border-white/20 dark:text-white/80">
                    Centre
                </button>
                <button type="button" onClick={() => { onChangeX(50); onChangeY(18); }} className="rounded-full border border-gray-300 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-gray-700 dark:border-white/20 dark:text-white/80">
                    Haut
                </button>
                <button type="button" onClick={() => { onChangeX(50); onChangeY(82); }} className="rounded-full border border-gray-300 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-gray-700 dark:border-white/20 dark:text-white/80">
                    Bas
                </button>
            </div>

            {imageUrl ? (
                <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/10">
                    <div className="aspect-[16/9] bg-gray-100 dark:bg-gray-900">
                        <img
                            src={imageUrl}
                            alt="Apercu cadrage"
                            className="h-full w-full object-cover"
                            style={{ objectPosition: `${safeX}% ${safeY}%` }}
                            loading="lazy"
                        />
                    </div>
                </div>
            ) : (
                <TextInput
                    value="Ajoutez une image pour previsualiser le cadrage"
                    readOnly
                    className="h-10 bg-white text-xs text-gray-500 dark:bg-gray-950 dark:text-white/60"
                />
            )}
        </div>
    );
}