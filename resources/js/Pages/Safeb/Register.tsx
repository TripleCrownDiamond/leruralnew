import MainLayout from '@/Layouts/MainLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Download,
    FileText,
    Mail,
    MapPin,
    Phone,
    Send,
} from 'lucide-react';
import SafebLogo from '@/Components/SafebLogo';
import {
    isSafebRegistrationType,
    SAFEB_REGISTRATION_MAP,
    SAFEB_REGISTRATION_TYPES,
    type SafebRegistrationType,
} from './registrationConfig';

interface RegisterProps {
    type: SafebRegistrationType;
    pdf_url: string;
}

export default function Register({ type, pdf_url }: RegisterProps) {
    const { props } = usePage<any>();
    const settings = props.settings ?? {};
    const flash = props.flash ?? {};

    const config = isSafebRegistrationType(type)
        ? SAFEB_REGISTRATION_MAP[type]
        : null;

    // Tous les hooks sont appelés avant tout retour conditionnel.
    const form = useForm({
        type,
        name: '',
        email: '',
        phone: '',
        organization: '',
        option_label: '',
        message: '',
    });

    if (!config) {
        return null;
    }

    const Icon = config.icon;

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.post(route('safeb.register'), {
            preserveScroll: true,
            onSuccess: () =>
                form.reset(
                    'name',
                    'email',
                    'phone',
                    'organization',
                    'option_label',
                    'message',
                ),
        });
    };

    const otherTypes = SAFEB_REGISTRATION_TYPES.filter(
        (item) => item.type !== type,
    );

    return (
        <MainLayout title={`${config.title} - SAFEB 2026`}>
            <Head title={`${config.title} - SAFEB 2026`}>
                <meta
                    head-key="description"
                    name="description"
                    content={`${config.title} au SAFEB 2026 — Salon de l'Autonomisation de la Femme Entrepreneure Rurale du Bénin. Parakou, 15 au 17 octobre 2026. ${config.description}`}
                />
            </Head>

            <article className="space-y-6">
                {/* Breadcrumb */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href={route('safeb.index')}
                        className="group inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-gray-600 transition hover:border-[#543D32]/30 hover:text-[#543D32] dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70 dark:hover:text-[#E4B23E]"
                    >
                        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                        Retour au SAFEB
                    </Link>
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#543D32]/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#543D32] dark:bg-[#E4B23E]/10 dark:text-[#E4B23E]">
                        <CalendarDays className="h-3.5 w-3.5" />
                        15 au 17 octobre 2026 · Parakou
                    </span>
                </div>

                {/* Header */}
                <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#241610_0%,#3B2A20_55%,#543D32_100%)] px-6 py-8 text-white shadow-[0_30px_70px_-40px_rgba(0,0,0,0.7)] sm:px-10">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-10"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
                            backgroundSize: '22px 22px',
                        }}
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#E4B23E]/15 blur-3xl"
                    />
                    <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#E4B23E] text-gray-950 shadow-lg shadow-[#E4B23E]/30">
                            <Icon className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#E4B23E]">
                                Inscription SAFEB 2026
                            </p>
                            <h1 className="mt-1.5 font-heading text-3xl font-black uppercase tracking-tight sm:text-4xl">
                                {config.title}
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/75">
                                {config.description}
                            </p>
                        </div>
                    </div>
                </header>

                {flash.success && (
                    <div className="flex items-start gap-3 rounded-3xl border border-[#E4B23E]/40 bg-[#FDF6E8] px-5 py-4 text-sm font-semibold text-[#6B4A10] dark:border-[#E4B23E]/30 dark:bg-[#3B2A20]/60 dark:text-[#E4B23E]">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                        {flash.success}
                    </div>
                )}
                {flash.error && (
                    <div className="rounded-3xl border border-red-300 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700 dark:border-red-600/40 dark:bg-red-900/20 dark:text-red-300">
                        {flash.error}
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                    {/* ============ FORMULAIRE ============ */}
                    <section className="rounded-[2rem] border border-gray-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03] sm:p-8">
                        <h2 className="font-heading text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                            Formulaire d'inscription
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-white/65">
                            Remplissez le formulaire ci-dessous, l'équipe SAFEB vous
                            contactera à l'adresse indiquée pour confirmer votre
                            participation.
                        </p>

                        <form onSubmit={submit} className="mt-6 space-y-4">
                            <input type="hidden" name="type" value={type} />

                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="Nom complet *" error={form.errors.name}>
                                    <input
                                        type="text"
                                        value={form.data.name}
                                        onChange={(e) =>
                                            form.setData('name', e.target.value)
                                        }
                                        placeholder="Votre nom et prénom"
                                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-[#E4B23E] focus:outline-none focus:ring-2 focus:ring-[#E4B23E]/25 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                        required
                                    />
                                </Field>
                                <Field label="Email *" error={form.errors.email}>
                                    <input
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) =>
                                            form.setData('email', e.target.value)
                                        }
                                        placeholder="vous@exemple.com"
                                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-[#E4B23E] focus:outline-none focus:ring-2 focus:ring-[#E4B23E]/25 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                        required
                                    />
                                </Field>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="Téléphone" error={form.errors.phone}>
                                    <input
                                        type="text"
                                        value={form.data.phone}
                                        onChange={(e) =>
                                            form.setData('phone', e.target.value)
                                        }
                                        placeholder="+229 ..."
                                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-[#E4B23E] focus:outline-none focus:ring-2 focus:ring-[#E4B23E]/25 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    />
                                </Field>
                                <Field
                                    label="Organisation / Structure"
                                    error={form.errors.organization}
                                >
                                    <input
                                        type="text"
                                        value={form.data.organization}
                                        onChange={(e) =>
                                            form.setData('organization', e.target.value)
                                        }
                                        placeholder="Nom de votre structure"
                                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-[#E4B23E] focus:outline-none focus:ring-2 focus:ring-[#E4B23E]/25 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    />
                                </Field>
                            </div>

                            <Field
                                label={config.optionLabel}
                                error={form.errors.option_label}
                            >
                                <select
                                    value={form.data.option_label}
                                    onChange={(e) =>
                                        form.setData('option_label', e.target.value)
                                    }
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-[#E4B23E] focus:outline-none focus:ring-2 focus:ring-[#E4B23E]/25 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                >
                                    <option value="">
                                        Sélectionnez une option...
                                    </option>
                                    {config.options.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field
                                label={config.messageLabel}
                                error={form.errors.message}
                            >
                                <textarea
                                    rows={4}
                                    value={form.data.message}
                                    onChange={(e) =>
                                        form.setData('message', e.target.value)
                                    }
                                    placeholder={config.messagePlaceholder}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm leading-relaxed focus:border-[#E4B23E] focus:outline-none focus:ring-2 focus:ring-[#E4B23E]/25 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                />
                            </Field>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-[11px] leading-relaxed text-gray-400 dark:text-white/40">
                                    L'équipe SAFEB vous contactera à l'adresse indiquée
                                    pour confirmer votre participation.
                                </p>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#543D32] px-7 text-xs font-black uppercase tracking-[0.16em] text-white shadow-[0_16px_40px_-18px_rgba(84,61,50,0.8)] transition-all hover:bg-[#3B2A20] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#E4B23E] dark:text-gray-950 dark:hover:bg-[#EFC867]"
                                >
                                    <Send className="h-4 w-4" />
                                    {form.processing
                                        ? 'Envoi en cours...'
                                        : "Envoyer mon inscription"}
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* ============ INFOS ============ */}
                    <aside className="space-y-4">
                        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(150deg,#3B2A20_0%,#543D32_60%,#6B5244_100%)] p-6 text-white shadow-[0_24px_60px_-36px_rgba(0,0,0,0.7)]">
                            <SafebLogo className="mx-auto w-32 rounded-2xl shadow-lg ring-1 ring-white/10" />
                            <h3 className="mt-5 text-center font-heading text-lg font-black uppercase tracking-tight">
                                SAFEB 2026
                            </h3>
                            <p className="mt-1 text-center text-xs font-semibold text-white/70">
                                Salon de l'Autonomisation de la Femme Entrepreneure
                                Rurale du Bénin
                            </p>
                            <div className="mt-5 space-y-2 text-xs font-semibold text-white/85">
                                <p className="flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4 text-[#E4B23E]" />
                                    15 au 17 octobre 2026
                                </p>
                                <p className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-[#E4B23E]" />
                                    Parakou, Bénin
                                </p>
                                <p className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-[#E4B23E]" />
                                    {settings.contact_phone || '+229 01 90 35 04 90'}
                                </p>
                                <p className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-[#E4B23E]" />
                                    {settings.contact_email || 'plurimediac@gmail.com'}
                                </p>
                            </div>
                            <a
                                href={pdf_url}
                                download
                                className="mt-5 flex items-center justify-center gap-2 rounded-full bg-[#E4B23E] px-5 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-gray-950 shadow-[0_14px_36px_-16px_rgba(228,178,62,0.8)] transition hover:bg-[#EFC867]"
                            >
                                <Download className="h-4 w-4" />
                                Brochure PDF
                            </a>
                        </div>

                        <div className="rounded-[2rem] border border-gray-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#543D32] dark:text-[#E4B23E]">
                                <FileText className="h-4 w-4" />
                                <span>Autres inscriptions</span>
                            </div>
                            <div className="mt-4 space-y-2">
                                {otherTypes.map((item) => {
                                    const OtherIcon = item.icon;
                                    return (
                                        <Link
                                            key={item.type}
                                            href={route('safeb.register.form', {
                                                type: item.type,
                                            })}
                                            className="group flex items-center justify-between gap-2 rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-3 text-xs font-black uppercase tracking-tight text-gray-700 transition hover:border-[#E4B23E]/40 hover:bg-white hover:text-[#543D32] dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:text-[#E4B23E]"
                                        >
                                            <span className="flex items-center gap-2.5">
                                                <OtherIcon className="h-4 w-4 text-[#543D32] dark:text-[#E4B23E]" />
                                                {item.title}
                                            </span>
                                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </aside>
                </div>
            </article>
        </MainLayout>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <label className="block">
            <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                {label}
            </span>
            {children}
            {error && (
                <span className="mt-1 block text-xs font-semibold text-red-600 dark:text-red-300">
                    {error}
                </span>
            )}
        </label>
    );
}
