import MainLayout from '@/Layouts/MainLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Mail, MapPin, Phone, SendHorizonal } from 'lucide-react';

export default function Contact() {
    const { props } = usePage<any>();
    const settings = props.settings ?? {};
    const baseUrl = (() => {
        try {
            return props.ziggy?.location
                ? new URL(props.ziggy.location).origin
                : window.location.origin;
        } catch {
            return 'https://lerural.bj';
        }
    })();
    const shareDescription =
        'Contactez la redaction LE RURAL pour vos informations, partenariats et messages.';
    const shareImage = `${baseUrl}/logos/logo.png`;
    const shareUrl = props.ziggy?.location || `${baseUrl}/contact`;
    const flash = props.flash ?? {};

    const form = useForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.post(route('contact.submit'), {
            preserveScroll: true,
            onSuccess: () => form.reset('subject', 'message'),
        });
    };

    return (
        <MainLayout title="Contact">
            <Head title="Contact">
                <meta
                    head-key="description"
                    name="description"
                    content={shareDescription}
                />
                <meta head-key="og:type" property="og:type" content="website" />
                <meta
                    head-key="og:site_name"
                    property="og:site_name"
                    content="LE RURAL"
                />
                <meta
                    head-key="og:title"
                    property="og:title"
                    content="Contact"
                />
                <meta
                    head-key="og:description"
                    property="og:description"
                    content={shareDescription}
                />
                <meta
                    head-key="og:image"
                    property="og:image"
                    content={shareImage}
                />
                <meta
                    head-key="og:image:secure_url"
                    property="og:image:secure_url"
                    content={shareImage}
                />
                <meta head-key="og:url" property="og:url" content={shareUrl} />
                <meta
                    head-key="twitter:card"
                    name="twitter:card"
                    content="summary_large_image"
                />
                <meta
                    head-key="twitter:title"
                    name="twitter:title"
                    content="Contact"
                />
                <meta
                    head-key="twitter:description"
                    name="twitter:description"
                    content={shareDescription}
                />
                <meta
                    head-key="twitter:image"
                    name="twitter:image"
                    content={shareImage}
                />
                <link head-key="canonical" rel="canonical" href={shareUrl} />
            </Head>

            <article className="mx-auto max-w-6xl space-y-6">
                <section className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-gray-950 via-gray-900 to-primary/30 px-6 py-10 text-white shadow-[0_28px_70px_-40px_rgba(47,106,17,0.7)] sm:px-8 sm:py-12">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-10"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
                            backgroundSize: '22px 22px',
                        }}
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/25 blur-3xl"
                    />

                    <div className="relative">
                        <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-white/85">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                            Contact
                        </p>
                        <h1 className="mt-4 font-heading text-3xl font-black uppercase tracking-tight sm:text-5xl">
                            Contactez la redaction
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm text-white/75">
                            Envoyez votre message via ce formulaire. L'equipe LE
                            RURAL vous repondra a l'adresse indiquee.
                        </p>
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
                    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03] sm:p-8">
                        <div className="mb-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            <span>Formulaire</span>
                        </div>

                        {flash.success && (
                            <div className="mb-4 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-600/40 dark:bg-emerald-900/20 dark:text-emerald-300">
                                {flash.success}
                            </div>
                        )}
                        {flash.error && (
                            <div className="mb-4 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-600/40 dark:bg-red-900/20 dark:text-red-300">
                                {flash.error}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="Nom" error={form.errors.name}>
                                    <input
                                        type="text"
                                        value={form.data.name}
                                        onChange={(e) =>
                                            form.setData('name', e.target.value)
                                        }
                                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                        required
                                    />
                                </Field>
                                <Field label="Email" error={form.errors.email}>
                                    <input
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) =>
                                            form.setData(
                                                'email',
                                                e.target.value,
                                            )
                                        }
                                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                        required
                                    />
                                </Field>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field
                                    label="Telephone"
                                    error={form.errors.phone}
                                >
                                    <input
                                        type="text"
                                        value={form.data.phone}
                                        onChange={(e) =>
                                            form.setData(
                                                'phone',
                                                e.target.value,
                                            )
                                        }
                                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    />
                                </Field>
                                <Field
                                    label="Sujet"
                                    error={form.errors.subject}
                                >
                                    <input
                                        type="text"
                                        value={form.data.subject}
                                        onChange={(e) =>
                                            form.setData(
                                                'subject',
                                                e.target.value,
                                            )
                                        }
                                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                        required
                                    />
                                </Field>
                            </div>

                            <Field label="Message" error={form.errors.message}>
                                <textarea
                                    rows={6}
                                    value={form.data.message}
                                    onChange={(e) =>
                                        form.setData('message', e.target.value)
                                    }
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm leading-relaxed focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    required
                                />
                            </Field>

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-br from-primary to-emerald-700 px-5 text-[11px] font-black uppercase tracking-[0.16em] text-white shadow-[0_14px_34px_-18px_rgba(47,106,17,0.7)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <SendHorizonal className="h-4 w-4" />
                                {form.processing
                                    ? 'Envoi en cours...'
                                    : 'Envoyer le message'}
                            </button>
                        </form>
                    </div>

                    <aside className="space-y-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                        <h2 className="font-heading text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">
                            Coordonnees
                        </h2>

                        <div className="space-y-3 text-sm text-gray-700 dark:text-white/80">
                            <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                                <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                                <span>
                                    {settings.contact_address ||
                                        'Adresse non configuree.'}
                                </span>
                            </div>
                            <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                                <Phone className="mt-0.5 h-4 w-4 text-primary" />
                                <span>
                                    {settings.contact_phone ||
                                        'Telephone non configure.'}
                                </span>
                            </div>
                            <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                                <Mail className="mt-0.5 h-4 w-4 text-primary" />
                                <span>
                                    {settings.contact_email ||
                                        'Email non configure.'}
                                </span>
                            </div>
                        </div>
                    </aside>
                </section>
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
