import SafebLogo from '@/Components/SafebLogo';
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
    Film,
    Globe2,
    Handshake,
    Landmark,
    Mail,
    MapPin,
    Megaphone,
    Mic2,
    Phone,
    Presentation,
    Store,
    Ticket,
    Users,
    Video,
    Wheat,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

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

/**
 * URL de la page d'inscription dediee a une activite. C'est cette URL qui est
 * comptabilisee dans les statistiques de conversion du tableau de bord.
 */
function safeRegisterUrl(type: string): string {
    try {
        if (typeof route === 'function' && route().has('safeb.register.form')) {
            return route('safeb.register.form', { type });
        }
    } catch {
        // Ziggy indisponible : on retombe sur l'URL canonique.
    }

    return `/safeb/inscription/${type}`;
}

interface SafebProps {
    pdf_url: string;
    safeb_settings?: {
        stats?: Array<{ value: string; label: string }>;
        packs?: Array<{
            name: string;
            range: string;
            tag: string;
            features: string[];
            highlight: boolean;
        }>;
        registration_tabs?: Array<{
            type: string;
            label: string;
            description: string;
            icon: string;
            enabled: boolean;
        }>;
        form_options?: Record<string, string[]>;
        composantes?: Array<{ icon: string; title: string; text: string }>;
        page_text?: Record<string, any>;
    };
}

type RegistrationType =
    | 'panel'
    | 'partner'
    | 'stand'
    | 'masterclass'
    | 'pitch'
    | 'culinary'
    | 'film';

const REGISTRATION_TABS: {
    type: RegistrationType;
    label: string;
    description: string;
    icon: React.ReactNode;
}[] = [
    {
        type: 'panel',
        label: 'Participant au panel',
        description:
            'Participer en tant que personne physique aux panels et debats du SAFEB.',
        icon: <Users className="h-5 w-5" />,
    },
    {
        type: 'partner',
        label: 'Partenaire',
        description:
            'Devenir partenaire officiel : sponsoring, visibilite institutionnelle, terrain et digitale.',
        icon: <Handshake className="h-5 w-5" />,
    },
    {
        type: 'stand',
        label: 'Reservation de stand',
        description:
            'Exposer vos produits au sein de la foire et du village gastronomique du salon.',
        icon: <Store className="h-5 w-5" />,
    },
    {
        type: 'masterclass',
        label: 'Masterclass',
        description:
            "S'inscrire aux sessions intensives de renforcement de capacites du SAFEB.",
        icon: <Mic2 className="h-5 w-5" />,
    },
    {
        type: 'pitch',
        label: 'Concours de pitch',
        description:
            "Presenter votre projet devant un jury d'investisseurs et d'experts.",
        icon: <Award className="h-5 w-5" />,
    },
    {
        type: 'culinary',
        label: "Concours d'art culinaire",
        description:
            'Mettre en valeur votre specialite culinaire traditionnelle beninoise.',
        icon: <Globe2 className="h-5 w-5" />,
    },
    {
        type: 'film',
        label: 'Concours de films',
        description:
            'Valoriser les parcours inspirants des femmes rurales a travers le cinema.',
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
    "Entrepreneuriat et creation d'entreprise",
    'Leadership et management',
];

const COMPOSANTES = [
    {
        icon: 'Store',
        title: 'Foire et exposition',
        text: 'Un espace commercial structure : agriculture, transformation agroalimentaire, artisanat, cosmétique naturelle, textile et economie verte.',
    },
    {
        icon: 'Mic2',
        title: 'Master class',
        text: 'Sessions intensives de renforcement de capacites destinees aux femmes entrepreneures, jeunes filles et porteurs de projets.',
    },
    {
        icon: 'Presentation',
        title: 'Panels et conferences',
        text: "Experts nationaux et internationaux, decideurs publics, partenaires techniques et financiers autour des grands enjeux de l'autonomisation.",
    },
    {
        icon: 'Award',
        title: 'Concours de pitch',
        text: "Les meilleures initiatives portees par les femmes rurales presentees devant un jury d'investisseurs et d'experts.",
    },
    {
        icon: 'Film',
        title: 'Competition de films',
        text: 'Valoriser les parcours inspirants des femmes rurales a travers le cinema, le documentaire et les productions audiovisuelles.',
    },
    {
        icon: 'Handshake',
        title: 'Rencontres B2B et networking',
        text: "Un espace dedie aux rencontres d'affaires pour favoriser les partenariats strategiques entre femmes entrepreneures et acteurs de l'ecosysteme.",
    },
    {
        icon: 'Globe2',
        title: 'Village gastronomique',
        text: 'Un espace de decouverte, de degustation et de valorisation du patrimoine culinaire beninois.',
    },
    {
        icon: 'Ticket',
        title: 'Concert et soiree de gala',
        text: "Des animations d'artistes engages pour les questions des femmes, chaque soir des deux premiers jours du salon.",
    },
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
            "Priorite dans le choix de l'emplacement",
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
            "10 invitations VIP + table d'honneur au gala",
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

    // Barre d'inscription collante (mobile) : on l'efface des que le formulaire
    // est lui-meme a l'ecran, pour ne pas recouvrir ses propres champs.
    const registrationRef = useRef<HTMLElement>(null);
    const [registrationVisible, setRegistrationVisible] = useState(false);

    useEffect(() => {
        const update = () => {
            const target = registrationRef.current;

            if (!target) {
                return;
            }

            const { top, bottom } = target.getBoundingClientRect();

            // Le formulaire occupe l'ecran des que son haut est passe sous la
            // moitie basse du viewport et qu'il n'est pas encore entierement remonte.
            setRegistrationVisible(
                top < window.innerHeight * 0.75 && bottom > 0,
            );
        };

        update();
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);

        return () => {
            window.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
        };
    }, []);

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
            return safeb_settings.registration_tabs.filter(
                (t) => t.enabled !== false,
            );
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

    const removeFile = (
        field: 'pitch_files' | 'culinary_files' | 'film_files',
        index: number,
    ) => {
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

    const showOptionSelect = [
        'panel',
        'partner',
        'stand',
        'masterclass',
    ].includes(activeType);
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
                <meta
                    head-key="og:site_name"
                    property="og:site_name"
                    content="LE RURAL"
                />
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
                <meta head-key="og:url" property="og:url" content="/safeb" />
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

            {/* pb-28 reserve la hauteur de la barre d'inscription collante :
                meme si son masquage automatique echoue, elle ne recouvre rien. */}
            <article className="space-y-10 pb-28 lg:pb-0">
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
                        <div className="flex flex-wrap items-center gap-4">
                            <SafebLogo className="h-20 w-20 shrink-0 rounded-2xl shadow-lg ring-1 ring-white/15 sm:h-24 sm:w-24" />

                            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-amber-300 backdrop-blur-sm">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-70" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-300" />
                                </span>
                                Edition 2026
                            </div>
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
                            Le SAFEB se veut une plateforme nationale et
                            regionale de reference dediee a la promotion du
                            leadership feminin en milieu rural : expositions,
                            rencontres d'affaires, sessions de formation,
                            conferences thematiques, masterclass, concours
                            d'innovation et mecanismes de mise en relation avec
                            les institutions de financement.
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
                            {pageText.context_title ||
                                'Un pilier essentiel des economie locales'}
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-white/70">
                            {pageText.context_body ||
                                "Les femmes rurales constituent un pilier essentiel des systemes agroalimentaires en Afrique de l'Ouest. Au Benin, elles jouent un role determinant dans la production agricole, la transformation et la commercialisation des produits agro-sylvo-pastoraux et halieutiques, ainsi que dans la preservation de la securite alimentaire des menages."}
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-white/70">
                            Organise chaque annee a l'occasion de la Journee
                            internationale des femmes rurales celebree le 15
                            octobre, le SAFEB contribue a renforcer les
                            capacites entrepreneuriales des femmes rurales et a
                            accroitre leur competitivite sur les marches
                            nationaux et regionaux.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03] sm:p-8">
                        <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            <span>Objectifs</span>
                        </div>
                        <h2 className="font-heading text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                            {pageText.objectives_title ||
                                'Un cadre privilegie de dialogue'}
                        </h2>
                        <ul className="mt-4 space-y-3">
                            {(
                                pageText.objectives || [
                                    'Promouvoir les produits et services des femmes entrepreneures rurales',
                                    'Renforcer leurs capacites entrepreneuriales et digitales',
                                    'Faciliter leur acces au financement et aux marches',
                                    'Valoriser leurs parcours a travers le cinema et les medias',
                                    'Celebrer et recompenser les femmes inspirantes',
                                ]
                            ).map((item: string) => (
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
                            <div
                                key={item.title}
                                className="group rounded-3xl border border-gray-200/80 bg-gray-50/50 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white hover:shadow-[0_18px_44px_-24px_rgba(47,106,17,0.4)] dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                            >
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white dark:bg-primary/20">
                                    {resolveIcon(item.icon)}
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
                        Une visibilite institutionnelle, terrain et digitale sur
                        tous les supports de l'evenement, en presence des
                        autorites et des delegations etrangeres.
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
                                    {pack.features.map((feature: string) => (
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
                                    attendus, packs sponsoring et contact :
                                    retrouvez l'integralite du dossier en PDF.
                                </p>
                            </div>
                        </div>
                        <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                            <a
                                href="#inscription"
                                className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-xs font-black uppercase tracking-[0.16em] text-white shadow-[0_20px_50px_-20px_rgba(47,106,17,0.8)] transition-all hover:-translate-y-0.5 hover:bg-primary/90"
                            >
                                S'inscrire au salon
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </a>
                            <a
                                href={pdf_url}
                                download
                                className="group inline-flex items-center justify-center gap-2 rounded-full bg-gray-950 px-7 py-4 text-xs font-black uppercase tracking-[0.16em] text-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] transition-all hover:-translate-y-0.5 hover:bg-gray-800"
                            >
                                <Download className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                                Brochure PDF
                            </a>
                        </div>
                    </div>
                </section>

                {/* ============ INSCRIPTION ============ */}
                <section
                    id="inscription"
                    ref={registrationRef}
                    className="scroll-mt-28"
                >
                    <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03] sm:p-8">
                        <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            <span>Inscription</span>
                        </div>
                        <h2 className="font-heading text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                            Rejoignez le SAFEB 2026
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-white/70">
                            Choisissez votre type de participation. Chaque
                            activite a sa propre page d'inscription, avec les
                            informations qui la concernent.
                        </p>

                        {/* Chaque carte mene a l'URL dediee de l'activite : c'est elle
                            qui est mesuree dans les statistiques de conversion. */}
                        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {enabledTabs.map((tab: any) => (
                                <a
                                    key={tab.type}
                                    href={safeRegisterUrl(tab.type)}
                                    className="group flex h-full flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_20px_45px_-25px_rgba(47,106,17,0.5)] dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-primary/40"
                                >
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary/20">
                                        {typeof tab.icon === 'string'
                                            ? resolveIcon(tab.icon)
                                            : tab.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-heading text-base font-black uppercase tracking-tight text-gray-900 dark:text-white">
                                            {tab.label}
                                        </h3>
                                        <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-white/65">
                                            {tab.description}
                                        </p>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-primary">
                                        S'inscrire
                                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                                    </span>
                                </a>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ============ CONTACT ============ */}
                <section className="grid gap-4 sm:grid-cols-3">
                    <ContactCard
                        icon={<Phone className="h-5 w-5" />}
                        label="Telephone"
                        value={
                            pageText.contact_phone ||
                            settings.contact_phone ||
                            '+229 01 90 35 04 90'
                        }
                    />
                    <ContactCard
                        icon={<Mail className="h-5 w-5" />}
                        label="Email"
                        value={
                            pageText.contact_email ||
                            settings.contact_email ||
                            'plurimediac@gmail.com'
                        }
                    />
                    <ContactCard
                        icon={<MapPin className="h-5 w-5" />}
                        label="Adresse"
                        value={
                            pageText.contact_address ||
                            settings.contact_address ||
                            'ABOMEY-CALAVI, Benin'
                        }
                    />
                </section>

                <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-primary/25 bg-primary/5 px-6 py-6 text-center">
                    <Megaphone className="h-6 w-6 text-primary" />
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary">
                        Organise par LE RURAL
                    </p>
                    <p className="max-w-xl text-xs leading-relaxed text-gray-600 dark:text-white/60">
                        Le SAFEB ambitionne de devenir une plateforme nationale
                        et regionale de reference pour la promotion de
                        l'entrepreneuriat feminin rural, la creation de
                        partenariats d'affaires et l'acces aux opportunites
                        d'investissement.
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/40">
                        <Users className="h-3.5 w-3.5" />
                        Femmes rurales · Institutions · Partenaires techniques
                        et financiers
                    </div>
                </div>
            </article>

            {/* Barre d'inscription collante — mobile uniquement, masquee des que
                le formulaire d'inscription est a l'ecran. */}
            <div
                className={`fixed inset-x-0 bottom-0 z-[120] border-t border-white/10 bg-gray-950/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur-xl transition-all duration-300 lg:hidden ${
                    registrationVisible
                        ? 'pointer-events-none translate-y-full opacity-0'
                        : 'translate-y-0 opacity-100'
                }`}
            >
                <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">
                            SAFEB 2026
                        </p>
                        <p className="truncate text-[11px] font-semibold text-white/60">
                            15-17 oct. · Parakou
                        </p>
                    </div>
                    <a
                        href={pdf_url}
                        download
                        aria-label="Telecharger la brochure SAFEB 2026"
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
                    >
                        <Download className="h-4 w-4" />
                    </a>
                    <a
                        href="#inscription"
                        className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-amber-400 px-5 text-xs font-black uppercase tracking-[0.14em] text-gray-950 shadow-lg shadow-amber-400/30 transition hover:bg-amber-300"
                    >
                        S'inscrire
                        <ArrowRight className="h-4 w-4" />
                    </a>
                </div>
            </div>
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

function ContactCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-3 rounded-3xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary/20">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/45">
                    {label}
                </p>
                <p className="mt-1 truncate text-sm font-bold text-gray-900 dark:text-white">
                    {value}
                </p>
            </div>
        </div>
    );
}
