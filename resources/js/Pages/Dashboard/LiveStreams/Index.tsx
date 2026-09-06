import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';

import { AdminButton } from '@/Components/Dashboard/AdminButton';

import InputError from '@/Components/InputError';

import DashboardLayout from '@/Layouts/DashboardLayout';

import { Head, router, useForm, usePage } from '@inertiajs/react';

import type { PageProps } from '@/types';

import { Pencil, Plus, Radio, Trash2 } from 'lucide-react';

import ImageWithFallback from '@/Components/ImageWithFallback';

import MediaLibraryPicker from '@/Components/MediaLibraryPicker';

import { cn } from '@/lib/utils';

import { useEffect, useMemo, useState } from 'react';

interface LiveStream {
    id: number;

    platform:
        | 'youtube'
        | 'facebook'
        | 'tiktok'
        | 'twitch'
        | 'obs'
        | 'streamyard'
        | 'custom';

    title: string;

    stream_url: string;

    embed_url: string | null;

    replay_url: string | null;

    thumbnail_url: string | null;

    fallback_image_url: string | null;

    starts_at: string | null;

    ends_at: string | null;

    sort_order: number;

    is_active: boolean;
}

type StreamStatus = 'current' | 'ended' | 'upcoming';

type LiveStreamGroup = {
    label: string;

    key: string;

    items: LiveStream[];
};

const emptyForm = {
    platform: 'youtube' as LiveStream['platform'],

    title: '',

    stream_url: '',

    embed_url: '',

    replay_url: '',

    thumbnail_url: '',

    fallback_image_url: '',

    starts_at: '',

    ends_at: '',

    sort_order: 0,

    is_active: true,
};

const formatDatetimeLocal = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const toDatetimeLocal = (value?: string | null) => {
    if (!value) {
        return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return formatDatetimeLocal(date);
};

const buildDefaultSchedule = () => {
    const now = new Date();
    now.setSeconds(0, 0);

    const end = new Date(now.getTime() + 60 * 60 * 1000);

    return {
        starts_at: formatDatetimeLocal(now),
        ends_at: formatDatetimeLocal(end),
    };
};

const addOneHour = (datetimeLocal: string) => {
    const date = new Date(datetimeLocal);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return formatDatetimeLocal(new Date(date.getTime() + 60 * 60 * 1000));
};

const toDateKey = (value?: string | null) => {
    if (!value) {
        return 'unscheduled';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'unscheduled';
    }

    return date.toISOString().slice(0, 10);
};

const formatDayLabel = (key: string) => {
    if (key === 'unscheduled') {
        return 'Sans date';
    }

    const date = new Date(`${key}T12:00:00`);

    return date.toLocaleDateString('fr-FR', {
        weekday: 'long',

        day: 'numeric',

        month: 'long',
    });
};

const toDate = (value?: string | null): Date | null => {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
};

const getStreamStatus = (stream: LiveStream, now: number): StreamStatus => {
    const startAt = toDate(stream.starts_at);

    const endAt = toDate(stream.ends_at);

    if (
        startAt &&
        startAt.getTime() <= now &&
        (!endAt || endAt.getTime() >= now)
    ) {
        return 'current';
    }

    if (endAt && endAt.getTime() < now) {
        return 'ended';
    }

    return 'upcoming';
};

const getStatusMeta = (status: StreamStatus) => {
    if (status === 'current') {
        return {
            label: 'En cours',

            wrapper:
                'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/30 dark:text-emerald-300',

            card: 'border-emerald-400/35 ring-2 ring-emerald-500/15',
        };
    }

    if (status === 'ended') {
        return {
            label: 'Terminee',

            wrapper:
                'border-gray-300 bg-gray-100 text-gray-600 dark:border-white/10 dark:bg-white/10 dark:text-white/60',

            card: 'border-gray-200 opacity-85 dark:border-white/10',
        };
    }

    return {
        label: 'A venir',

        wrapper:
            'border-amber-300/40 bg-amber-100 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/15 dark:text-amber-300',

        card: 'border-gray-200 dark:border-white/10',
    };
};

export default function Index({ liveStreams }: { liveStreams: LiveStream[] }) {
    const { props } =
        usePage<
            PageProps<{ settings?: Record<string, string | null | undefined> }>
        >();

    const fallbackVideoUrl =
        props.settings?.live_fallback_video_url?.trim() ||
        'https://www.youtube.com/playlist?list=PLbG50jPcxecnHpAmGv6XBaQ4mgbPyRAN5';

    const form = useForm({
        ...(emptyForm as any),
        ...buildDefaultSchedule(),
        id: null as number | null,
    });

    const isEditing = Boolean(form.data.id);

    const [now, setNow] = useState(() => Date.now());

    const activeStreams = useMemo(
        () =>
            liveStreams.filter(
                (stream) => getStreamStatus(stream, now) === 'current',
            ),

        [liveStreams, now],
    );

    const latestEndedStream = useMemo(
        () =>
            [...liveStreams]

                .filter((stream) => getStreamStatus(stream, now) === 'ended')

                .sort((a, b) => {
                    const endA =
                        toDate(a.ends_at)?.getTime() ??
                        Number.NEGATIVE_INFINITY;

                    const endB =
                        toDate(b.ends_at)?.getTime() ??
                        Number.NEGATIVE_INFINITY;

                    if (endA !== endB) {
                        return endB - endA;
                    }

                    return b.id - a.id;
                })[0] ?? null,

        [liveStreams, now],
    );

    const endedStreams = useMemo(
        () =>
            [...liveStreams]

                .filter((stream) => getStreamStatus(stream, now) === 'ended')

                .sort((a, b) => {
                    const endA =
                        toDate(a.ends_at)?.getTime() ??
                        Number.NEGATIVE_INFINITY;

                    const endB =
                        toDate(b.ends_at)?.getTime() ??
                        Number.NEGATIVE_INFINITY;

                    if (endA !== endB) {
                        return endB - endA;
                    }

                    return b.id - a.id;
                }),

        [liveStreams, now],
    );

    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 30000);

        return () => window.clearInterval(timer);
    }, []);

    const groupedStreams = useMemo<LiveStreamGroup[]>(() => {
        const map = new Map<string, LiveStream[]>();

        [...liveStreams]

            .filter((stream) => getStreamStatus(stream, now) !== 'ended')

            .sort((a, b) => {
                const startA = a.starts_at
                    ? new Date(a.starts_at).getTime()
                    : Number.POSITIVE_INFINITY;

                const startB = b.starts_at
                    ? new Date(b.starts_at).getTime()
                    : Number.POSITIVE_INFINITY;

                if (startA !== startB) {
                    return startA - startB;
                }

                if (a.sort_order !== b.sort_order) {
                    return a.sort_order - b.sort_order;
                }

                return a.id - b.id;
            })

            .forEach((stream) => {
                const key = toDateKey(stream.starts_at);

                const current = map.get(key) ?? [];

                current.push(stream);

                map.set(key, current);
            });

        return Array.from(map.entries()).map(([key, items]) => ({
            key,

            label: formatDayLabel(key),

            items,
        }));
    }, [liveStreams]);

    const resetForm = () => {
        form.clearErrors();

        form.setData({
            ...(emptyForm as any),
            ...buildDefaultSchedule(),
            id: null,
        });
    };

    const applyCurrentSchedule = () => {
        form.clearErrors('starts_at', 'ends_at');
        form.setData({
            ...form.data,
            ...buildDefaultSchedule(),
        });
    };

    const startEdit = (stream: LiveStream) => {
        form.setData({
            id: stream.id,

            platform: stream.platform,

            title: stream.title,

            stream_url: stream.stream_url,

            embed_url: stream.embed_url ?? '',

            replay_url: stream.replay_url ?? '',

            thumbnail_url: stream.thumbnail_url ?? '',

            fallback_image_url: stream.fallback_image_url ?? '',

            starts_at: toDatetimeLocal(stream.starts_at),

            ends_at: toDatetimeLocal(stream.ends_at),

            sort_order: stream.sort_order,

            is_active: stream.is_active,
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            form.put(route('dashboard.live-streams.update', form.data.id), {
                preserveScroll: true,

                onSuccess: resetForm,
            });

            return;
        }

        form.post(route('dashboard.live-streams.store'), {
            preserveScroll: true,

            onSuccess: resetForm,
        });
    };

    const setMedia = (
        key: 'thumbnail_url' | 'fallback_image_url',

        value: string,
    ) => {
        form.setData(key, value);
    };

    return (
        <DashboardLayout title="Lives">
            <Head title="Lives" />

            <div className="space-y-8">
                <AdminPageHeader
                    eyebrow="Diffusion"
                    title="Programmation live"
                    subtitle="Planifiez vos flux Youtube, Facebook, TikTok, Twitch ou OBS avec image, horodatage et fallback visuel."
                    icon={<Radio className="h-6 w-6" />}
                    meta={`${liveStreams.length} live${liveStreams.length > 1 ? 's' : ''}`}
                />

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="grid gap-4 rounded-3xl border border-primary/15 bg-primary/5 p-4 dark:border-primary/20 dark:bg-primary/10 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                                Jingle direct
                            </p>

                            <h2 className="mt-2 text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">
                                Source jingle active
                            </h2>

                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                Cette source (video ou playlist) tourne quand aucune emission n'est en cours. Elle alterne avec les emissions par defaut actives dans la grille Emissions.
                            </p>

                            <p className="mt-2 break-all text-xs font-semibold text-gray-500 dark:text-gray-400">
                                {fallbackVideoUrl}
                            </p>
                        </div>

                        <a
                            href={route('dashboard.widgets.index')}
                            className="inline-flex h-fit items-center justify-center rounded-full bg-primary px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-primary/25 transition hover:scale-[1.01]"
                        >
                            Gerer le jingle
                        </a>
                    </div>

                    <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-gray-900">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                            En cours
                        </p>

                        <div className="mt-3 flex min-h-[88px] flex-col justify-center gap-2">
                            {activeStreams.length > 0 ? (
                                activeStreams.slice(0, 2).map((stream) => (
                                    <div
                                        key={stream.id}
                                        className="bg-emerald-500/8 rounded-2xl border border-emerald-500/20 px-3 py-2"
                                    >
                                        <p className="text-xs font-black uppercase tracking-tight text-gray-900 dark:text-white">
                                            {stream.title}
                                        </p>

                                        <p className="mt-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                                            {stream.platform}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-gray-300 px-3 py-4 text-sm text-gray-500 dark:border-white/10 dark:text-gray-400">
                                    Aucune diffusion active pour le moment.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {latestEndedStream && (
                    <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-gray-900">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                            Derniere terminee
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-3">
                            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
                                {latestEndedStream.platform}
                            </span>

                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {latestEndedStream.title}
                            </p>

                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {latestEndedStream.ends_at || 'Terminee'}
                            </span>
                        </div>
                    </div>
                )}

                <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
                    <form
                        onSubmit={submit}
                        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900"
                    >
                        <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                            {isEditing
                                ? 'Modifier la programmation'
                                : 'Nouvelle diffusion'}
                        </h2>

                        <div className="mt-5 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-semibold">
                                    Plateforme
                                </label>

                                <select
                                    value={form.data.platform}
                                    onChange={(e) =>
                                        form.setData(
                                            'platform',

                                            e.target.value as any,
                                        )
                                    }
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-950"
                                >
                                    <option value="youtube">YouTube</option>

                                    <option value="facebook">Facebook</option>

                                    <option value="tiktok">TikTok</option>

                                    <option value="twitch">Twitch</option>

                                    <option value="obs">OBS</option>

                                    <option value="streamyard">
                                        StreamYard
                                    </option>

                                    <option value="custom">Autre</option>
                                </select>

                                <InputError
                                    message={form.errors.platform}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold">
                                    Titre
                                </label>

                                <input
                                    value={form.data.title}
                                    onChange={(e) =>
                                        form.setData('title', e.target.value)
                                    }
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-950"
                                />

                                <InputError
                                    message={form.errors.title}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold">
                                    URL du flux
                                </label>

                                <input
                                    value={form.data.stream_url}
                                    onChange={(e) =>
                                        form.setData(
                                            'stream_url',

                                            e.target.value,
                                        )
                                    }
                                    placeholder="Lien vers le live, la page ou la source de diffusion"
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-950"
                                />

                                <InputError
                                    message={form.errors.stream_url}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold">
                                    URL embed (optionnel)
                                </label>

                                <input
                                    value={form.data.embed_url}
                                    onChange={(e) =>
                                        form.setData(
                                            'embed_url',

                                            e.target.value,
                                        )
                                    }
                                    placeholder="Iframe ou url d embed"
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-950"
                                />

                                <InputError
                                    message={form.errors.embed_url}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold">
                                    URL de rediffusion
                                </label>

                                <input
                                    value={form.data.replay_url}
                                    onChange={(e) =>
                                        form.setData(
                                            'replay_url',

                                            e.target.value,
                                        )
                                    }
                                    placeholder="Lien de replay ou d archive"
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-950"
                                />

                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Pour les plateformes non YouTube, utilisez
                                    un lien de lecture ou d embed compatible
                                    navigateur.
                                </p>

                                <InputError
                                    message={form.errors.replay_url}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    Image de programmation
                                </label>

                                <div className="space-y-3">
                                    {form.data.thumbnail_url ? (
                                        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-gray-950">
                                            <div className="aspect-video">
                                                <ImageWithFallback
                                                    src={
                                                        form.data.thumbnail_url
                                                    }
                                                    alt={
                                                        form.data.title ||
                                                        'Apercu'
                                                    }
                                                    className="h-full w-full object-cover"
                                                    fallbackSrc="/images/article-placeholder.svg"
                                                />
                                            </div>
                                        </div>
                                    ) : null}

                                    <div className="flex flex-wrap gap-2">
                                        <MediaLibraryPicker
                                            buttonLabel="Choisir image"
                                            title="Selectionner l'image de programmation"
                                            onSelect={(url) =>
                                                setMedia('thumbnail_url', url)
                                            }
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setMedia('thumbnail_url', '')
                                            }
                                            className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-gray-700 dark:border-white/20 dark:text-gray-200"
                                        >
                                            Retirer
                                        </button>
                                    </div>
                                </div>

                                <InputError
                                    message={form.errors.thumbnail_url}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    Image de secours
                                </label>

                                <div className="space-y-3">
                                    {form.data.fallback_image_url ? (
                                        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-gray-950">
                                            <div className="aspect-video">
                                                <ImageWithFallback
                                                    src={
                                                        form.data
                                                            .fallback_image_url
                                                    }
                                                    alt="Fallback"
                                                    className="h-full w-full object-cover"
                                                    fallbackSrc="/images/article-placeholder.svg"
                                                />
                                            </div>
                                        </div>
                                    ) : null}

                                    <div className="flex flex-wrap gap-2">
                                        <MediaLibraryPicker
                                            buttonLabel="Choisir fallback"
                                            title="Selectionner l'image de secours"
                                            onSelect={(url) =>
                                                setMedia(
                                                    'fallback_image_url',

                                                    url,
                                                )
                                            }
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setMedia(
                                                    'fallback_image_url',

                                                    '',
                                                )
                                            }
                                            className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-gray-700 dark:border-white/20 dark:text-gray-200"
                                        >
                                            Retirer
                                        </button>
                                    </div>
                                </div>

                                <InputError
                                    message={form.errors.fallback_image_url}
                                    className="mt-1"
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-semibold">Horaires</p>

                                    <button
                                        type="button"
                                        onClick={applyCurrentSchedule}
                                        className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-primary transition hover:bg-primary/15"
                                    >
                                        Maintenant +1h
                                    </button>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-sm font-semibold">
                                            Debut
                                        </label>

                                        <input
                                            type="datetime-local"
                                            value={form.data.starts_at}
                                            onChange={(e) => {
                                                const nextStart = e.target.value;
                                                form.setData('starts_at', nextStart);

                                                if (
                                                    !form.data.ends_at ||
                                                    form.data.ends_at <= nextStart
                                                ) {
                                                    form.setData(
                                                        'ends_at',
                                                        addOneHour(nextStart),
                                                    );
                                                }
                                            }}
                                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-950"
                                        />

                                        <InputError
                                            message={form.errors.starts_at}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-semibold">
                                            Fin
                                        </label>

                                        <input
                                            type="datetime-local"
                                            value={form.data.ends_at}
                                            min={form.data.starts_at || undefined}
                                            onChange={(e) =>
                                                form.setData(
                                                    'ends_at',

                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-950"
                                        />

                                        <InputError
                                            message={form.errors.ends_at}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold">
                                    Ordre
                                </label>

                                <input
                                    type="number"
                                    min={0}
                                    value={form.data.sort_order}
                                    onChange={(e) =>
                                        form.setData(
                                            'sort_order',

                                            Number(e.target.value) || 0,
                                        )
                                    }
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-950"
                                />

                                <InputError
                                    message={form.errors.sort_order}
                                    className="mt-1"
                                />
                            </div>

                            <label className="flex items-center gap-2 text-sm font-semibold">
                                <input
                                    type="checkbox"
                                    checked={form.data.is_active}
                                    onChange={(e) =>
                                        form.setData(
                                            'is_active',

                                            e.target.checked,
                                        )
                                    }
                                />
                                Programmation active
                            </label>
                        </div>

                        <div className="mt-6 flex gap-2">
                            <AdminButton
                                type="submit"
                                icon={<Plus className="h-4 w-4" />}
                                disabled={form.processing}
                            >
                                {isEditing ? 'Mettre a jour' : 'Ajouter'}
                            </AdminButton>

                            {isEditing && (
                                <AdminButton
                                    type="button"
                                    variant="secondary"
                                    onClick={resetForm}
                                >
                                    Annuler
                                </AdminButton>
                            )}
                        </div>
                    </form>

                    <div className="space-y-6">
                        {endedStreams.length > 0 && (
                            <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900">
                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                                            Archive
                                        </p>

                                        <h3 className="mt-1 text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">
                                            Diffusions terminees
                                        </h3>
                                    </div>

                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-gray-600 dark:bg-white/10 dark:text-white/60">
                                        {endedStreams.length} diff
                                        {endedStreams.length > 1 ? 'usions' : 'usion'}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    {endedStreams.map((stream) => (
                                        <div
                                            key={stream.id}
                                            className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                                                    {stream.title}
                                                </p>
                                                <p className="mt-0.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                                                    {stream.platform}
                                                    {stream.ends_at
                                                        ? ` · fin le ${stream.ends_at}`
                                                        : ''}
                                                </p>
                                            </div>

                                            <div className="flex shrink-0 gap-2">
                                                <AdminButton
                                                    type="button"
                                                    variant="secondary"
                                                    size="icon"
                                                    icon={
                                                        <Pencil className="h-4 w-4" />
                                                    }
                                                    onClick={() =>
                                                        startEdit(stream)
                                                    }
                                                    title="Modifier le lien"
                                                />

                                                <AdminButton
                                                    type="button"
                                                    variant="danger"
                                                    size="icon"
                                                    icon={
                                                        <Trash2 className="h-4 w-4" />
                                                    }
                                                    onClick={() => {
                                                        if (
                                                            confirm(
                                                                'Supprimer cette programmation ?',
                                                            )
                                                        ) {
                                                            router.delete(
                                                                route(
                                                                    'dashboard.live-streams.destroy',

                                                                    stream.id,
                                                                ),

                                                                {
                                                                    preserveScroll: true,
                                                                },
                                                            );
                                                        }
                                                    }}
                                                    title="Supprimer"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {groupedStreams.length > 0 ? (
                            groupedStreams.map((group) => (
                                <section
                                    key={group.key}
                                    className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900"
                                >
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                                                Jour
                                            </p>

                                            <h3 className="mt-1 text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">
                                                {group.label}
                                            </h3>
                                        </div>

                                        <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-primary">
                                            {group.items.length} emission
                                            {group.items.length > 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    <div className="grid auto-rows-fr gap-4 md:grid-cols-2">
                                        {group.items.map((stream) => {
                                            const status = getStreamStatus(
                                                stream,

                                                now,
                                            );

                                            const meta = getStatusMeta(status);

                                            return (
                                                <article
                                                    key={stream.id}
                                                    className={cn(
                                                        'flex h-full min-h-[420px] flex-col overflow-hidden rounded-3xl border bg-white shadow-sm transition dark:bg-gray-950',

                                                        meta.card,
                                                    )}
                                                >
                                                    <div className="aspect-[16/9] shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-950">
                                                        <ImageWithFallback
                                                            src={
                                                                stream.thumbnail_url ||
                                                                stream.fallback_image_url ||
                                                                undefined
                                                            }
                                                            alt={stream.title}
                                                            className="h-full w-full object-cover"
                                                            fallbackSrc="/images/article-placeholder.svg"
                                                        />
                                                    </div>

                                                    <div className="flex flex-1 flex-col p-5">
                                                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em]">
                                                            <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
                                                                {
                                                                    stream.platform
                                                                }
                                                            </span>

                                                            <span
                                                                className={cn(
                                                                    'rounded-full border px-2 py-1',

                                                                    meta.wrapper,
                                                                )}
                                                            >
                                                                {meta.label}
                                                            </span>
                                                        </div>

                                                        <h4 className="mt-3 line-clamp-2 text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">
                                                            {stream.title}
                                                        </h4>

                                                        <div className="mt-3 grid gap-2 text-xs text-gray-500 dark:text-gray-400 sm:grid-cols-2">
                                                            <div className="rounded-2xl bg-gray-50 px-3 py-2 dark:bg-white/5">
                                                                Debut:{' '}
                                                                {stream.starts_at ||
                                                                    'Non planifie'}
                                                            </div>

                                                            <div className="rounded-2xl bg-gray-50 px-3 py-2 dark:bg-white/5">
                                                                Fin:{' '}
                                                                {stream.ends_at ||
                                                                    'Non planifie'}
                                                            </div>

                                                            <div className="rounded-2xl bg-gray-50 px-3 py-2 dark:bg-white/5">
                                                                Ordre:{' '}
                                                                {
                                                                    stream.sort_order
                                                                }
                                                            </div>

                                                            <div className="rounded-2xl bg-gray-50 px-3 py-2 dark:bg-white/5">
                                                                {stream.is_active
                                                                    ? 'Actif'
                                                                    : 'Inactif'}
                                                            </div>
                                                        </div>

                                                        <div className="mt-auto flex flex-wrap gap-2 pt-4">
                                                            <AdminButton
                                                                type="button"
                                                                variant="secondary"
                                                                size="icon"
                                                                icon={
                                                                    <Pencil className="h-4 w-4" />
                                                                }
                                                                onClick={() =>
                                                                    startEdit(
                                                                        stream,
                                                                    )
                                                                }
                                                                title="Modifier"
                                                            />

                                                            <AdminButton
                                                                type="button"
                                                                variant="danger"
                                                                size="icon"
                                                                icon={
                                                                    <Trash2 className="h-4 w-4" />
                                                                }
                                                                onClick={() => {
                                                                    if (
                                                                        confirm(
                                                                            'Supprimer cette programmation ?',
                                                                        )
                                                                    ) {
                                                                        router.delete(
                                                                            route(
                                                                                'dashboard.live-streams.destroy',

                                                                                stream.id,
                                                                            ),

                                                                            {
                                                                                preserveScroll: true,
                                                                            },
                                                                        );
                                                                    }
                                                                }}
                                                                title="Supprimer"
                                                            />
                                                        </div>
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </div>
                                </section>
                            ))
                        ) : (
                            <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-sm text-gray-500 dark:border-white/10 dark:bg-gray-900 dark:text-gray-400">
                                Aucune emission a venir n'est encore definie.
                                Les diffusions en cours et a venir apparaitront
                                ici.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}




