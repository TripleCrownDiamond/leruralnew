import MainLayout from '@/Layouts/MainLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Award,
    Building2,
    CalendarDays,
    CheckCircle2,
    Download,
    FileText,
    Globe2,
    Handshake,
    Landmark,
    Mail,
    MapPin,
    Megaphone,
    Mic2,
    Phone,
    Presentation,
    Send,
    Store,
    Ticket,
    Upload,
    Users,
    Video,
    Wheat,
    X,
    Film,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

/** Resolve icon name string to React component */
const ICON_MAP: Record<string, React.ReactNode> = {
    Store: <Store className="h-5 w-5" />,
    Mic2: <Mic2 className="h-5 w-5" />,
    Presentation: <Presentation className="h-5 w-5" />,
    Award: <Award className="h-5 w-5" />,
    Film: <Film className="h-5 w-5" />,
    Handshake: <Handshake className="h-5 w-5" />,
    Globe2: <Globe2 className="h-5 w-5" />,
    Ticket: <Ticket className="h-5 w-5" />,
    Users: <Users className="h-5 w-5" />,
    Video: <Video className="h-5 w-5" />,
};

function resolveIcon(name: string): React.ReactNode {
    return ICON_MAP[name] ?? <Store className="h-5 w-5" />;
}

interface SafebProps {
    pdf_url: string;
    safeb_settings?: {
        stats?: Array<{ value: string; label: string }>;
        packs?: Array<{ name: string; range: string; tag: string; features: string[]; highlight: boolean }>;
        registration_tabs?: Array<{ type: string; label: string; description: string; icon: string; enabled: boolean }>;
        form_options?: Record<string, string[]>;
        composantes?: Array<{ icon: string; title: string; text: string }>;
        page_text?: Record<string, any>;
    };
}

type RegistrationType = 'panel' | 'partner' | 'stand' | 'masterclass' | 'pitch' | 'culinary' | 'film';

const REGISTRATION_TABS: {
    type: RegistrationType;
    label: string;
    description: string;
    icon: React.ReactNode;
}[] = [
    {
        type: 'panel',
        label: 'Participant au panel',
        description: "Participer en tant que personne physique aux panels et debats du SAFEB.",
        icon: <Users className="h-5 w-5" />,
    },
    {
        type: 'partner',
        label: 'Partenaire',
        description: "Devenir partenaire officiel : sponsoring, visibilite institutionnelle, terrain et digitale.",
        icon: <Handshake className="h-5 w-5" />,
    },
    {
        type: 'stand',
        label: 'Reservation de stand',
        description: "Exposer vos produits au sein de la foire et du village gastronomique du salon.",
        icon: <Store className="h-5 w-5" />,
    },
    {
        type: 'masterclass',
        label: 'Masterclass',
        description: "S'inscrire aux sessions intensives de renforcement de capacites du SAFEB.",
        icon: <Mic2 className="h-5 w-5" />,
    },
    {
        type: 'pitch',
        label: 'Concours de pitch',
        description: "Presenter votre projet devant un jury d'investisseurs et d'experts.",
        icon: <Award className="h-5 w-5" />,
    },
    {
        type: 'culinary',
        label: "Concours d'art culinaire",
        description: "Mettre en valeur votre specialite culinaire traditionnelle beninoise.",
        icon: <Globe2 className="h-5 w-5" />,
    },
    {
        type: 'film',
        label: 'Concours de films',
        description: "Valoriser les parcours inspirants des femmes rurales a travers le cinema.",
        icon: <Film className="h-5 w-5" />,
    },
];

const PANEL_OPTIONS = [
    'Femme entrepreneure rurale',
    'Jeune femme / Porteuse de projet',
    'Femme leaders communautaire',
    'Beneficiaire de microfinance',
    'Experte / Mentor',
];

const PARTNER_OPTIONS = [
    'Pack Bronze (1 a 3 millions FCFA)',
    'Pack Argent (3 a 7 millions FCFA)',
    'Pack Or (7 a 10 millions FCFA)',
    'Partenariat media',
];

const STAND_OPTIONS = [
    'Stand Bronze — 100 000 FCFA',
    'Stand Argent — 250 000 FCFA',
    'Stand Or — 500 000 FCFA',
    'Espace Village Gastronomique — 50 000 FCFA',
];

const MASTERCLASS_OPTIONS = [
    'Transformation agroalimentaire',
    'Marketing digital et reseaux sociaux',
    'Gestion financiere et comptabilite',
    'Entrepreneuriat et creation d\'entreprise',
    'Leadership et management',
];

const COMPOSANTES = [
    { icon: 'Store', title: 'Foire et exposition', text: 'Un espace commercial structure : agriculture, transformation agroalimentaire, artisanat, cosmétique naturelle, textile et economie verte.' },
    { icon: 'Mic2', title: 'Master class', text: 'Sessions intensives de renforcement de capacites destinees aux femmes entrepreneures, jeunes filles et porteurs de projets.' },
    { icon: 'Presentation', title: 'Panels et conferences', text: 'Experts nationaux et internationaux, decideurs publics, partenaires techniques et financiers autour des grands enjeux de l\'autonomisation.' },
    { icon: 'Award', title: 'Concours de pitch', text: 'Les meilleures initiatives portees par les femmes rurales presentees devant un jury d\'investisseurs et d\'experts.' },
    { icon: 'Film', title: 'Competition de films', text: 'Valoriser les parcours inspirants des femmes rurales a travers le cinema, le documentaire et les productions audiovisuelles.' },
    { icon: 'Handshake', title: 'Rencontres B2B et networking', text: 'Un espace dedie aux rencontres d\'affaires pour favoriser les partenariats strategiques entre femmes entrepreneures et acteurs de l\'ecosysteme.' },
    { icon: 'Globe2', title: 'Village gastronomique', text: 'Un espace de decouverte, de degustation et de valorisation du patrimoine culinaire beninois.' },
    { icon: 'Ticket', title: 'Concert et soiree de gala', text: 'Des animations d\'artistes engages pour les questions des femmes, chaque soir des deux premiers jours du salon.' },
];

const STATS = [
    { value: '300', label: 'Femmes exposantes' },
    { value: '5 000+', label: 'Visiteurs attendus' },
    { value: '150', label: 'Rencontres B2B' },
    { value: '50', label: 'Institutions participantes' },
    { value: '20', label: 'Conferences de haut niveau' },
    { value: '100', label: 'Jeunes femmes formees' },
];

const PACKS = [
    {
        name: 'Pack Bronze',
        range: '1 a 3 millions FCFA',
        tag: 'Decouverte',
        features: [
            'Logo sur les supports officiels du salon',
            'Stand aménagé de 9 m²',
            '2 badges exposants',
            'Accès aux rencontres B2B',
            '2 publications sponsorisees',
            'Interview video de presentation (2 min)',
            '1 invitation VIP + participation au gala (2 pers.)',
        ],
        highlight: false,
    },
    {
        name: 'Pack Argent',
        range: '3 a 7 millions FCFA',
        tag: 'Privilege',
        features: [
            'Tous les avantages du Pack Bronze',
            'Stand premium de 18 m²',
            '4 badges exposants',
            'Priorite dans le choix de l\'emplacement',
            '5 publications sponsorisees',
            'Reportage institutionnel (5 min)',
            '5 invitations VIP + table reservee au gala (5 pers.)',
            'Participation aux rencontres B2B Premium',
        ],
        highlight: true,
    },
    {
        name: 'Pack Or',
        range: '7 a 10 millions FCFA',
        tag: 'Premium',
        features: [
            'Tous les avantages des Packs Bronze et Argent',
            'Statut officiel de Partenaire Premium',
            'Grand stand premium de 36 m²',
            '8 badges exposants',
            'Campagne speciale sur LE RURAL TV',
            '10 invitations VIP + table d\'honneur au gala',
            'Trophee officiel de reconnaissance',
            'Certificat de Partenaire Premium',
        ],
        highlight: false,
    },
];

const ACCEPTED_PITCH_FILES = '.pdf,.jpg,.jpeg,.png';
const ACCEPTED_VIDEO_FILES = '.mp4,.mov,.avi,.webm';
const MAX_FILE_SIZE_MB = 10;
const MAX_VIDEO_SIZE_MB = 50;

export default function Safeb({ pdf_url, safeb_settings }: SafebProps) {
    const { props } = usePage<any>();
    const settings = props.settings ?? {};
    const flash = props.flash ?? {};

    // Use DB settings with fallback to hardcoded defaults
    const pageStats = safeb_settings?.stats ?? STATS;
    const pagePacks = safeb_settings?.packs ?? PACKS;
    const pageComposantes = safeb_settings?.composantes ?? COMPOSANTES;
    const pageText = safeb_settings?.page_text ?? {};

    const [activeType, setActiveType] = useState<RegistrationType>('panel');

    const form = useForm<{
        type: RegistrationType;
        name: string;
        email: string;
        phone: string;
        organization: string;
        option_label: string;
        specialty: string;
        message: string;
        pitch_files: File[];
        culinary_files: File[];
        film_files: File[];
    }>({
        type: 'panel',
        name: '',
        email: '',
        phone: '',
        organization: '',
        option_label: '',
        specialty: '',
        message: '',
        pitch_files: [],
        culinary_files: [],
        film_files: [],
    });

    const pitchFileRef = useRef<HTMLInputElement>(null);
    const culinaryFileRef = useRef<HTMLInputElement>(null);
    const filmFileRef = useRef<HTMLInputElement>(null);

    const optionChoices = useMemo(() => {
        const dbOptions = safeb_settings?.form_options?.[activeType];
        if (dbOptions) return dbOptions;
        switch (activeType) {
            case 'panel':
                return PANEL_OPTIONS;
            case 'partner':
                return PARTNER_OPTIONS;
            case 'stand':
                return STAND_OPTIONS;
            case 'masterclass':
                return MASTERCLASS_OPTIONS;
            default:
                return [];
        }
    }, [activeType, safeb_settings?.form_options]);

    const enabledTabs = useMemo(() => {
        if (safeb_settings?.registration_tabs) {
            return safeb_settings.registration_tabs.filter((t) => t.enabled !== false);
        }
        return REGISTRATION_TABS;
    }, [safeb_settings?.registration_tabs]);

    const switchType = (type: RegistrationType) => {
        setActiveType(type);
        form.setData('type', type);
        form.setData('option_label', '');
        form.setData('specialty', '');
        form.setData('pitch_files', []);
        form.setData('culinary_files', []);
        form.setData('film_files', []);
    };

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: 'pitch_files' | 'culinary_files' | 'film_files',
        maxFiles: number,
    ) => {
        const files = Array.from(e.target.files || []);
        const limited = files.slice(0, maxFiles);
        form.setData(field, limited);
    };

    const removeFile = (field: 'pitch_files' | 'culinary_files' | 'film_files', index: number) => {
        const current = [...form.data[field]];
        current.splice(index, 1);
        form.setData(field, current);
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.post(route('safeb.register'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () =>
                form.reset(
                    'name',
                    'email',
                    'phone',
                    'organization',
                    'option_label',
                    'specialty',
                    'message',
                    'pitch_files',
                    'culinary_files',
                    'film_files',
                ),
        });
    };

    const showOptionSelect = ['panel', 'partner', 'stand', 'masterclass'].includes(activeType);
    const showSpecialty = activeType === 'culinary' || activeType === 'film';
    const showPitchFiles = activeType === 'pitch';
    const showCulinaryFiles = activeType === 'culinary';
    const showFilmFiles = activeType === 'film';

    const optionLabel = useMemo(() => {
        switch (activeType) {
            case 'panel':
                return 'Votre profil / type de participation';
            case 'partner':
                return 'Formule de partenariat';
            case 'stand':
                return 'Configuration du stand';
            case 'masterclass':
                return 'Theme de la masterclass';
            default:
                return 'Option';
        }
    }, [activeType]);

    return (
        <MainLayout title="SAFEB 2026 - Salon de la Femme Entrepreneure Rurale">
            <Head title="SAFEB 2026 - Salon de l'Autonomisation de la Femme Entrepreneure Rurale du Benin">
                <meta
                    head-key="description"
                    name="description"
                    content="SAFEB 2026 - Salon de l'Autonomisation de la Femme Entrepreneure Rurale du Benin. Parakou, 15 au 17 octobre 2026. Expositions, panels, masterclass, concours de pitch, rencontres B2B et gala. Telechargez la brochure et inscrivez-vous."
                />
                <meta head-key="og:type" property="og:type" content="website" />
                <meta head-key="og:site_name" property="og:site_name" content="LE RURAL" />
                <meta
                    head-key="og:title"
                    property="og:title"
                    content="SAFEB 2026 - Salon de l'Autonomisation de la Femme Entrepreneure Rurale du Benin"
                />
                <meta
                    head-key="og:description"
                    property="og:description"
                    content="Parakou, 15 au 17 octobre 2026. Expositions, panels, masterclass, concours de pitch, rencontres B2B et gala."
                />
                <meta
                    head-key="og:image"
                    property="og:image"
                    content="/images/safeb-og.jpg"
                />
                <meta
                    head-key="og:image:secure_url"
                    property="og:image:secure_url"
                    content="/images/safeb-og.jpg"
                />
                <meta
                    head-key="og:image:alt"
                    property="og:image:alt"
                    content="SAFEB 2026 - Salon de l'Autonomisation de la Femme Entrepreneure Rurale"
                />
                <meta
                    head-key="og:url"
                    property="og:url"
                    content="/safeb"
                />
                <meta
                    head-key="og:locale"
                    property="og:locale"
                    content="fr_BJ"
                />
                <meta
                    head-key="twitter:card"
                    name="twitter:card"
                    content="summary_large_image"
                />
                <meta
                    head-key="twitter:title"
                    name="twitter:title"
                    content="SAFEB 2026 - Salon de l'Autonomisation de la Femme Entrepreneure Rurale du Benin"
                />
                <meta
                    head-key="twitter:description"
                    name="twitter:description"
                    content="Parakou, 15 au 17 octobre 2026. Expositions, panels, masterclass, concours de pitch, rencontres B2B et gala."
                />
                <meta
                    head-key="twitter:image"
                    name="twitter:image"
                    content="/images/safeb-og.jpg"
                />
                <link head-key="canonical" rel="canonical" href="/safeb" />
            </Head>

            <article className="space-y-10">
                {/* ============ HERO ============ */}
                <section className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-[linear-gradient(135deg,#0d1d0c_0%,#183a13_52%,#2f6a11_100%)] px-6 py-12 text-white shadow-[0_30px_80px_-40px_rgba(0,0,0,0.7)] sm:px-10 sm:py-16">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-10"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
                            backgroundSize: '24px 24px',
                        }}
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-amber-400/15 blur-3xl"
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl"
                    />

                    <div className="relative">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-amber-300 backdrop-blur-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-70" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-300" />
                            </span>
                            Edition 2026
                        </div>

                        <h1 className="mt-5 max-w-3xl font-heading text-4xl font-black uppercase leading-[1.02] tracking-tight sm:text-5xl md:text-6xl">
                            Salon de l'
                            <span className="bg-gradient-to-b from-amber-200 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                                Autonomisation
                            </span>{' '}
                            de la Femme Entrepreneure Rurale
                        </h1>

                        <p className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-black uppercase tracking-[0.2em] backdrop-blur-sm">
                            SAFEB 2026 · Benin
                        </p>

                        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/85">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-4 py-2 backdrop-blur-sm">
                                <CalendarDays className="h-4 w-4 text-amber-300" />
                                15 au 17 octobre 2026
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-4 py-2 backdrop-blur-sm">
                                <MapPin className="h-4 w-4 text-amber-300" />
                                Parakou, Benin
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-4 py-2 backdrop-blur-sm">
                                <Wheat className="h-4 w-4 text-amber-300" />
                                Femmes entrepreneures rurales
                            </span>
                        </div>

                        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
                            Le SAFEB se veut une plateforme nationale et regionale de
                            reference dediee a la promotion du leadership feminin en
                            milieu rural : expositions, rencontres d'affaires, sessions
                            de formation, conferences thematiques, masterclass,
                            concours d'innovation et mecanismes de mise en relation
                            avec les institutions de financement.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <a
                                href="#inscription"
                                className="group inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3.5 text-xs font-black uppercase tracking-[0.16em] text-gray-950 shadow-[0_16px_40px_-16px_rgba(251,191,36,0.8)] transition-all hover:-translate-y-0.5 hover:bg-amber-300"
                            >
                                S'inscrire au salon
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </a>
                            <a
                                href={pdf_url}
                                download
                                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3.5 text-xs font-black uppercase tracking-[0.16em] text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/20"
                            >
                                <Download className="h-4 w-4" />
                                Telecharger la brochure PDF
                            </a>
                        </div>
                    </div>
                </section>

                {/* ============ STATS ============ */}
                <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {pageStats.map((stat: any) => (
                        <div
                            key={stat.label}
                            className="rounded-3xl border border-gray-200/80 bg-white p-5 text-center shadow-[0_14px_40px_-28px_rgba(47,106,17,0.4)] dark:border-white/10 dark:bg-white/[0.04]"
                        >
                            <p className="font-heading text-3xl font-black tracking-tight text-primary dark:text-amber-300">
                                {stat.value}
                            </p>
                            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-gray-500 dark:text-white/55">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </section>

                {/* ============ CONTEXTE & OBJECTIFS ============ */}
                <section className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03] sm:p-8">
                        <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            <span>Contexte</span>
                        </div>
                        <h2 className="font-heading text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                            {pageText.context_title || 'Un pilier essentiel des economie locales'}
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-white/70">
                            {pageText.context_body || 'Les femmes rurales constituent un pilier essentiel des systemes agroalimentaires en Afrique de l\'Ouest. Au Benin, elles jouent un role determinant dans la production agricole, la transformation et la commercialisation des produits agro-sylvo-pastoraux et halieutiques, ainsi que dans la preservation de la securite alimentaire des menages.'}
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-white/70">
                            Organise chaque annee a l'occasion de la Journee
                            internationale des femmes rurales celebree le 15 octobre,
                            le SAFEB contribue a renforcer les capacites
                            entrepreneuriales des femmes rurales et a accroitre leur
                            competitivite sur les marches nationaux et regionaux.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03] sm:p-8">
                        <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            <span>Objectifs</span>
                        </div>
                        <h2 className="font-heading text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                            {pageText.objectives_title || 'Un cadre privilegie de dialogue'}
                        </h2>
                        <ul className="mt-4 space-y-3">
                            {(pageText.objectives || [
                                'Promouvoir les produits et services des femmes entrepreneures rurales',
                                'Renforcer leurs capacites entrepreneuriales et digitales',
                                'Faciliter leur acces au financement et aux marches',
                                'Valoriser leurs parcours a travers le cinema et les medias',
                                'Celebrer et recompenser les femmes inspirantes',
                            ]).map((item: string) => (
                                <li
                                    key={item}
                                    className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50/70 p-3.5 text-sm font-semibold text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
                                >
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* ============ COMPOSANTES ============ */}
                <section className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03] sm:p-8">
                    <div className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>Programme</span>
                    </div>
                    <h2 className="font-heading text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                        Composantes du projet
                    </h2>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {pageComposantes.map((item: any) => (
                            // Resolve icon name to component
                            Object.assign(item, { _icon: resolveIcon(item.icon) })
                        ).map((item: any) => (
                            <div
                                key={item.title}
                                className="group rounded-3xl border border-gray-200/80 bg-gray-50/50 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white hover:shadow-[0_18px_44px_-24px_rgba(47,106,17,0.4)] dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                            >
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white dark:bg-primary/20">
                                    {item._icon}
                                </div>
                                <h3 className="mt-3.5 text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white">
                                    {item.title}
                                </h3>
                                <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-white/65">
                                    {item.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ============ PACKS SPONSORING ============ */}
                <section className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03] sm:p-8">
                    <div className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>Partenaires</span>
                    </div>
                    <h2 className="font-heading text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                        Packs sponsoring
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm text-gray-600 dark:text-white/65">
                        Une visibilite institutionnelle, terrain et digitale sur tous
                        les supports de l'evenement, en presence des autorites et des
                        delegations etrangeres.
                    </p>

                    <div className="mt-8 grid gap-5 lg:grid-cols-3">
                        {pagePacks.map((pack: any) => (
                            <div
                                key={pack.name}
                                className={`relative flex flex-col rounded-3xl border p-6 transition-all hover:-translate-y-1 ${
                                    pack.highlight
                                        ? 'border-primary/40 bg-gradient-to-b from-primary/10 to-transparent shadow-[0_24px_60px_-30px_rgba(47,106,17,0.55)] dark:border-primary/50'
                                        : 'border-gray-200/80 bg-gray-50/50 shadow-sm dark:border-white/10 dark:bg-white/[0.03]'
                                }`}
                            >
                                {pack.highlight && (
                                    <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-white shadow-lg">
                                        Le plus demande
                                    </span>
                                )}
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                            {pack.tag}
                                        </p>
                                        <h3 className="mt-1 font-heading text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                                            {pack.name}
                                        </h3>
                                    </div>
                                    {pack.highlight ? (
                                        <Landmark className="h-8 w-8 text-primary" />
                                    ) : (
                                        <Building2 className="h-8 w-8 text-gray-300 dark:text-white/20" />
                                    )}
                                </div>
                                <p className="mt-3 inline-flex w-fit rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-black text-primary">
                                    {pack.range}
                                </p>
                                <ul className="mt-4 flex-1 space-y-2">
                                    {pack.features.map((feature) => (
                                        <li
                                            key={feature}
                                            className="flex items-start gap-2 text-xs leading-relaxed text-gray-600 dark:text-white/70"
                                        >
                                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    type="button"
                                    onClick={() => switchType('partner')}
                                    className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-[11px] font-black uppercase tracking-[0.16em] text-white shadow-[0_14px_34px_-18px_rgba(47,106,17,0.7)] transition-all hover:brightness-110"
                                >
                                    Devenir partenaire
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ============ BROCHURE PDF ============ */}
                <section className="relative overflow-hidden rounded-[2rem] border border-amber-300/30 bg-gradient-to-br from-amber-50 via-orange-50/40 to-amber-100/70 p-6 shadow-[0_24px_60px_-35px_rgba(180,83,9,0.5)] dark:border-amber-500/25 dark:from-amber-950/20 dark:via-transparent dark:to-orange-950/20 sm:p-10">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-400/15 blur-3xl"
                    />
                    <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-400/90 text-gray-950 shadow-lg shadow-amber-400/30">
                                <FileText className="h-7 w-7" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-700 dark:text-amber-300">
                                    Dossier de presentation
                                </p>
                                <h2 className="mt-1 font-heading text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                                    Telecharger la brochure SAFEB 2026
                                </h2>
                                <p className="mt-2 max-w-xl text-sm text-gray-600 dark:text-white/70">
                                    Contexte, objectifs, composantes, resultats
                                    attendus, packs sponsoring et contact : retrouvez
                                    l'integralite du dossier en PDF.
                                </p>
                            </div>
                        </div>
                        <a
                            href={pdf_url}
                            download
                            className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-gray-950 px-7 py-4 text-xs font-black uppercase tracking-[0.16em] text-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] transition-all hover:-translate-y-0.5 hover:bg-gray-800"
                        >
                            <Download className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                            Brochure PDF
                        </a>
                    </div>
                </section>

                {/* ============ INSCRIPTION ============ */}
                <section id="inscription" className="scroll-mt-28">
                    <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03] sm:p-8">
                        <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            <span>Inscription</span>
                        </div>
                        <h2 className="font-heading text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                            Rejoignez le SAFEB 2026
                        </h2>
                        <p className="mt-3 max-w-2xl text-sm text-gray-600 dark:text-white/65">
                            Choisissez votre type de participation, remplissez le formulaire et l'equipe SAFEB reviendra vers vous.
                        </p>

                        {flash.success && (
                            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3.5 text-sm font-semibold text-emerald-700 dark:border-emerald-600/40 dark:bg-emerald-900/20 dark:text-emerald-300">
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                                {flash.success}
                            </div>
                        )}
                        {flash.error && (
                            <div className="mt-5 rounded-2xl border border-red-300 bg-red-50 px-4 py-3.5 text-sm font-semibold text-red-700 dark:border-red-600/40 dark:bg-red-900/20 dark:text-red-300">
                                {flash.error}
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {enabledTabs.map((tab: any) => {
                                const isActive = activeType === tab.type;
                                return (
                                    <button
                                        key={tab.type}
                                        type="button"
                                        onClick={() => switchType(tab.type)}
                                        className={`group rounded-2xl border p-4 text-left transition-all ${
                                            isActive
                                                ? 'border-primary bg-primary/5 shadow-[0_14px_34px_-20px_rgba(47,106,17,0.6)] dark:border-primary/50'
                                                : 'border-gray-200/80 bg-gray-50/50 hover:border-primary/30 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]'
                                        }`}
                                    >
                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                                                isActive
                                                    ? 'bg-primary text-white'
                                                    : 'bg-primary/10 text-primary group-hover:bg-primary/15'
                                            }`}
                                        >
                                            {tab.icon}
                                        </div>
                                        <p
                                            className={`mt-3 text-xs font-black uppercase tracking-tight ${
                                                isActive
                                                    ? 'text-primary'
                                                    : 'text-gray-900 dark:text-white'
                                            }`}
                                        >
                                            {tab.label}
                                        </p>
                                        <p className="mt-1.5 text-[11px] leading-relaxed text-gray-500 dark:text-white/55">
                                            {tab.description}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Form */}
                        <form onSubmit={submit} className="mt-6 space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="Nom complet *" error={form.errors.name}>
                                    <input
                                        type="text"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        placeholder="Votre nom et prenom"
                                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                        required
                                    />
                                </Field>
                                <Field label="Email *" error={form.errors.email}>
                                    <input
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                        placeholder="vous@exemple.com"
                                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                        required
                                    />
                                </Field>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="Telephone" error={form.errors.phone}>
                                    <input
                                        type="text"
                                        value={form.data.phone}
                                        onChange={(e) => form.setData('phone', e.target.value)}
                                        placeholder="+229 ..."
                                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    />
                                </Field>
                                <Field label="Organisation / Structure" error={form.errors.organization}>
                                    <input
                                        type="text"
                                        value={form.data.organization}
                                        onChange={(e) => form.setData('organization', e.target.value)}
                                        placeholder="Nom de votre structure"
                                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    />
                                </Field>
                            </div>

                            {/* Option select (panel, partner, stand, masterclass) */}
                            {showOptionSelect && (
                                <Field label={optionLabel} error={form.errors.option_label}>
                                    <select
                                        value={form.data.option_label}
                                        onChange={(e) => form.setData('option_label', e.target.value)}
                                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    >
                                        <option value="">Selectionnez une option...</option>
                                        {optionChoices.map((choice) => (
                                            <option key={choice} value={choice}>{choice}</option>
                                        ))}
                                    </select>
                                </Field>
                            )}

                            {/* Specialty field (culinary: specialite, film: titre du film) */}
                            {showSpecialty && (
                                <Field
                                    label={activeType === 'culinary' ? 'Votre specialite culinaire *' : 'Titre du film *'}
                                    error={form.errors.specialty}
                                >
                                    <input
                                        type="text"
                                        value={form.data.specialty}
                                        onChange={(e) => form.setData('specialty', e.target.value)}
                                        placeholder={activeType === 'culinary' ? 'Ex: Tchoukoualo, Ablo, Kpintin...' : 'Titre de votre film'}
                                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                        required
                                    />
                                </Field>
                            )}

                            {/* Pitch file upload */}
                            {showPitchFiles && (
                                <Field label="Documents du projet *" error={form.errors.pitch_files}>
                                    <div className="space-y-3">
                                        <div
                                            onClick={() => pitchFileRef.current?.click()}
                                            className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-6 transition-colors hover:border-primary/50 hover:bg-primary/5 dark:border-white/15 dark:bg-white/[0.02] dark:hover:border-primary/40"
                                        >
                                            <Upload className="h-8 w-8 text-gray-400 dark:text-white/40" />
                                            <p className="text-xs font-bold text-gray-600 dark:text-white/70">Cliquez pour joindre vos fichiers</p>
                                            <p className="text-[10px] text-gray-400 dark:text-white/40">PDF, JPG, PNG — Max 10 Mo par fichier — Max 5 fichiers</p>
                                            <p className="text-[10px] text-primary">Business plan, fiche descriptive, besoins du projet...</p>
                                        </div>
                                        <input ref={pitchFileRef} type="file" accept={ACCEPTED_PITCH_FILES} multiple className="hidden" onChange={(e) => handleFileChange(e, 'pitch_files', 5)} />
                                        {form.data.pitch_files.length > 0 && (
                                            <div className="space-y-2">
                                                {form.data.pitch_files.map((file, index) => (
                                                    <div key={index} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5">
                                                        <div className="flex items-center gap-2">
                                                            <FileText className="h-4 w-4 text-primary" />
                                                            <span className="text-xs font-semibold text-gray-700 dark:text-white/80">{file.name}</span>
                                                            <span className="text-[10px] text-gray-400">({(file.size / 1024 / 1024).toFixed(1)} Mo)</span>
                                                        </div>
                                                        <button type="button" onClick={() => removeFile('pitch_files', index)} className="text-gray-400 hover:text-red-500">
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </Field>
                            )}

                            {/* Culinary video upload */}
                            {showCulinaryFiles && (
                                <Field label="Video de votre preparation (optionnel)" error={form.errors.culinary_files}>
                                    <div className="space-y-3">
                                        <div
                                            onClick={() => culinaryFileRef.current?.click()}
                                            className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-6 transition-colors hover:border-primary/50 hover:bg-primary/5 dark:border-white/15 dark:bg-white/[0.02] dark:hover:border-primary/40"
                                        >
                                            <Video className="h-8 w-8 text-gray-400 dark:text-white/40" />
                                            <p className="text-xs font-bold text-gray-600 dark:text-white/70">Cliquez pour joindre une video</p>
                                            <p className="text-[10px] text-gray-400 dark:text-white/40">MP4, MOV, AVI, WebM — Max 50 Mo — Max 3 videos</p>
                                        </div>
                                        <input ref={culinaryFileRef} type="file" accept={ACCEPTED_VIDEO_FILES} multiple className="hidden" onChange={(e) => handleFileChange(e, 'culinary_files', 3)} />
                                        {form.data.culinary_files.length > 0 && (
                                            <div className="space-y-2">
                                                {form.data.culinary_files.map((file, index) => (
                                                    <div key={index} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5">
                                                        <div className="flex items-center gap-2">
                                                            <Video className="h-4 w-4 text-primary" />
                                                            <span className="text-xs font-semibold text-gray-700 dark:text-white/80">{file.name}</span>
                                                            <span className="text-[10px] text-gray-400">({(file.size / 1024 / 1024).toFixed(1)} Mo)</span>
                                                        </div>
                                                        <button type="button" onClick={() => removeFile('culinary_files', index)} className="text-gray-400 hover:text-red-500">
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </Field>
                            )}

                            {/* Film video upload */}
                            {showFilmFiles && (
                                <Field label="Video du film (bande-annonce ou extrait) *" error={form.errors.film_files}>
                                    <div className="space-y-3">
                                        <div
                                            onClick={() => filmFileRef.current?.click()}
                                            className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-6 transition-colors hover:border-primary/50 hover:bg-primary/5 dark:border-white/15 dark:bg-white/[0.02] dark:hover:border-primary/40"
                                        >
                                            <Film className="h-8 w-8 text-gray-400 dark:text-white/40" />
                                            <p className="text-xs font-bold text-gray-600 dark:text-white/70">Cliquez pour joindre votre video</p>
                                            <p className="text-[10px] text-gray-400 dark:text-white/40">MP4, MOV, AVI, WebM — Max 50 Mo — Max 3 videos</p>
                                        </div>
                                        <input ref={filmFileRef} type="file" accept={ACCEPTED_VIDEO_FILES} multiple className="hidden" onChange={(e) => handleFileChange(e, 'film_files', 3)} />
                                        {form.data.film_files.length > 0 && (
                                            <div className="space-y-2">
                                                {form.data.film_files.map((file, index) => (
                                                    <div key={index} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5">
                                                        <div className="flex items-center gap-2">
                                                            <Film className="h-4 w-4 text-primary" />
                                                            <span className="text-xs font-semibold text-gray-700 dark:text-white/80">{file.name}</span>
                                                            <span className="text-[10px] text-gray-400">({(file.size / 1024 / 1024).toFixed(1)} Mo)</span>
                                                        </div>
                                                        <button type="button" onClick={() => removeFile('film_files', index)} className="text-gray-400 hover:text-red-500">
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </Field>
                            )}

                            <Field label="Message (optionnel)" error={form.errors.message}>
                                <textarea
                                    rows={4}
                                    value={form.data.message}
                                    onChange={(e) => form.setData('message', e.target.value)}
                                    placeholder={
                                        activeType === 'stand'
                                            ? 'Produits que vous souhaitez exposer, besoins en amenagement...'
                                            : activeType === 'partner'
                                              ? 'Vos attentes en matiere de visibilite et de partenariat...'
                                              : activeType === 'film'
                                                ? 'Description du film, theme, message du realisateur...'
                                                : 'Informations complementaires...'
                                    }
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm leading-relaxed focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                />
                            </Field>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-[11px] leading-relaxed text-gray-400 dark:text-white/40">
                                    L'equipe SAFEB vous contactera a l'adresse indiquee pour confirmer votre participation.
                                </p>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-br from-primary to-emerald-700 px-7 text-xs font-black uppercase tracking-[0.16em] text-white shadow-[0_16px_40px_-18px_rgba(47,106,17,0.8)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Send className="h-4 w-4" />
                                    {form.processing ? 'Envoi en cours...' : 'Envoyer mon inscription'}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>

                {/* ============ CONTACT ============ */}
                <section className="grid gap-4 sm:grid-cols-3">
                    <ContactCard icon={<Phone className="h-5 w-5" />} label="Telephone" value={pageText.contact_phone || settings.contact_phone || '+229 01 90 35 04 90'} />
                    <ContactCard icon={<Mail className="h-5 w-5" />} label="Email" value={pageText.contact_email || settings.contact_email || 'plurimediac@gmail.com'} />
                    <ContactCard icon={<MapPin className="h-5 w-5" />} label="Adresse" value={pageText.contact_address || settings.contact_address || 'ABOMEY-CALAVI, Benin'} />
                </section>

                <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-primary/25 bg-primary/5 px-6 py-6 text-center">
                    <Megaphone className="h-6 w-6 text-primary" />
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary">Organise par LE RURAL</p>
                    <p className="max-w-xl text-xs leading-relaxed text-gray-600 dark:text-white/60">
                        Le SAFEB ambitionne de devenir une plateforme nationale et regionale de reference pour la promotion de l'entrepreneuriat feminin rural, la creation de partenariats d'affaires et l'acces aux opportunites d'investissement.
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/40">
                        <Users className="h-3.5 w-3.5" />
                        Femmes rurales · Institutions · Partenaires techniques et financiers
                    </div>
                </div>
            </article>
        </MainLayout>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <label className="block">
            <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">{label}</span>
            {children}
            {error && <span className="mt-1 block text-xs font-semibold text-red-600 dark:text-red-300">{error}</span>}
        </label>
    );
}

function ContactCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3 rounded-3xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary/20">{icon}</div>
            <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/45">{label}</p>
                <p className="mt-1 truncate text-sm font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    );
}