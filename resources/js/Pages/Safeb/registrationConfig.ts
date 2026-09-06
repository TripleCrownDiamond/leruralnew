import {
    Award,
    CookingPot,
    Handshake,
    Mic2,
    Presentation,
    Store,
    type LucideIcon,
} from 'lucide-react';

export type SafebRegistrationType =
    | 'panel'
    | 'partner'
    | 'stand'
    | 'masterclass'
    | 'pitch'
    | 'culinary';

export interface SafebRegistrationConfig {
    type: SafebRegistrationType;
    /** Libellé court (badge, navigation). */
    label: string;
    /** Titre de la page / carte CTA. */
    title: string;
    description: string;
    icon: LucideIcon;
    /** Libellé du menu déroulant du formulaire. */
    optionLabel: string;
    options: string[];
    /** Placeholder du champ message. */
    messagePlaceholder: string;
    /** Titre court du bloc message. */
    messageLabel: string;
    /** Ordre d'affichage — priorité mise en avant. */
    priority?: boolean;
}

export const SAFEB_REGISTRATION_TYPES: SafebRegistrationConfig[] = [
    {
        type: 'partner',
        label: 'Partenaire',
        title: 'Devenir partenaire',
        description:
            'Sponsoring, visibilité institutionnelle, terrain et digitale sur tous les supports officiels du salon.',
        icon: Handshake,
        optionLabel: 'Formule de partenariat',
        options: [
            'Pack Bronze (1 à 3 millions FCFA)',
            'Pack Argent (3 à 7 millions FCFA)',
            'Pack Or (7 à 10 millions FCFA)',
            'Partenariat média',
            'Autre forme de partenariat',
        ],
        messagePlaceholder:
            'Vos attentes en matière de visibilité et de partenariat...',
        messageLabel: 'Votre projet de partenariat',
        priority: true,
    },
    {
        type: 'stand',
        label: 'Exposant',
        title: 'Louer un stand',
        description:
            'Exposer vos produits au sein de la foire et du village gastronomique du salon.',
        icon: Store,
        optionLabel: 'Configuration du stand',
        options: [
            'Stand aménagé de 9 m²',
            'Stand premium de 18 m²',
            'Grand stand premium de 36 m²',
            'Espace village gastronomique',
            'Autre configuration',
        ],
        messagePlaceholder:
            'Produits que vous souhaitez exposer, besoins en aménagement...',
        messageLabel: 'Vos produits à exposer',
    },
    {
        type: 'panel',
        label: 'Panéliste',
        title: "S'inscrire aux panels",
        description:
            "Intervenir comme panéliste, conférencier ou expert lors des panels et conférences du SAFEB.",
        icon: Presentation,
        optionLabel: 'Votre profil / rôle',
        options: [
            'Panéliste / conférencier',
            'Expert / modérateur',
            'Partenaire technique et financier',
            'Institution publique',
            'Institution financière',
            'Média / presse',
        ],
        messagePlaceholder:
            'Thématique proposée, expérience, disponibilités...',
        messageLabel: 'Votre contribution',
    },
    {
        type: 'masterclass',
        label: 'Masterclass',
        title: "S'inscrire à la masterclass",
        description:
            'Sessions intensives de renforcement de capacités destinées aux femmes entrepreneures, jeunes filles et porteurs de projets.',
        icon: Mic2,
        optionLabel: 'Session / thématique souhaitée',
        options: [
            'Accès au financement',
            'Digital & e-commerce',
            'Transformation agroalimentaire',
            'Marketing & techniques de vente',
            'Leadership & gestion d’entreprise',
            'Autre thématique',
        ],
        messagePlaceholder:
            'Vos attentes de formation, votre secteur d’activité...',
        messageLabel: 'Vos attentes de formation',
    },
    {
        type: 'pitch',
        label: 'Concours de pitch',
        title: 'S\'inscrire au concours de pitch',
        description:
            'Présenter votre initiative devant un jury d’investisseurs et d’experts pour gagner en visibilité et en financement.',
        icon: Award,
        optionLabel: 'Profil du projet',
        options: [
            'Projet en démarrage (idée)',
            'Projet en développement',
            'Entreprise existante',
            'Coopérative féminine',
        ],
        messagePlaceholder:
            'Décrivez votre projet : secteur, étape actuelle, besoin...',
        messageLabel: 'Présentation du projet',
    },
    {
        type: 'culinary',
        label: 'Art culinaire',
        title: 'S\'inscrire au concours d\'art culinaire',
        description:
            'Participer au concours d’art culinaire du village gastronomique et valoriser le patrimoine culinaire béninois.',
        icon: CookingPot,
        optionLabel: 'Votre spécialité',
        options: [
            'Cuisine traditionnelle',
            'Pâtisserie & viennoiserie',
            'Jus & boissons locales',
            'Produits transformés / conserves',
            'Épices & condiments',
            'Autre spécialité',
        ],
        messagePlaceholder:
            'Décrivez vos spécialités, votre expérience culinaire...',
        messageLabel: 'Vos spécialités',
    },
];

export const SAFEB_REGISTRATION_MAP: Record<
    SafebRegistrationType,
    SafebRegistrationConfig
> = Object.fromEntries(
    SAFEB_REGISTRATION_TYPES.map((config) => [config.type, config]),
) as Record<SafebRegistrationType, SafebRegistrationConfig>;

export function isSafebRegistrationType(
    value: string | undefined | null,
): value is SafebRegistrationType {
    return SAFEB_REGISTRATION_TYPES.some((config) => config.type === value);
}
