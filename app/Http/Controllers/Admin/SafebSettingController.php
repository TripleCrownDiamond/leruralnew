<?php

namespace App\Http\Controllers\Admin;

use App\Models\SafebSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SafebSettingController extends AdminController
{
    /**
     * Valeurs par defaut pour chaque section.
     * Utilisees lors de la premiere initialisation.
     */
    private const DEFAULTS = [
        'stats' => [
            ['value' => '300', 'label' => 'Femmes exposantes'],
            ['value' => '5 000+', 'label' => 'Visiteurs attendus'],
            ['value' => '150', 'label' => 'Rencontres B2B'],
            ['value' => '50', 'label' => 'Institutions participantes'],
            ['value' => '20', 'label' => 'Conferences de haut niveau'],
            ['value' => '100', 'label' => 'Jeunes femmes formees'],
        ],
        'packs' => [
            [
                'name' => 'Pack Bronze',
                'range' => '1 a 3 millions FCFA',
                'tag' => 'Decouverte',
                'features' => [
                    'Logo sur les supports officiels du salon',
                    'Stand amenage de 9 m2',
                    '2 badges exposants',
                    'Acces aux rencontres B2B',
                    '2 publications sponsorisees',
                    'Interview video de presentation (2 min)',
                    '1 invitation VIP + participation au gala (2 pers.)',
                ],
                'highlight' => false,
            ],
            [
                'name' => 'Pack Argent',
                'range' => '3 a 7 millions FCFA',
                'tag' => 'Privilege',
                'features' => [
                    'Tous les avantages du Pack Bronze',
                    'Stand premium de 18 m2',
                    '4 badges exposants',
                    'Priorite dans le choix de l\'emplacement',
                    '5 publications sponsorisees',
                    'Reportage institutionnel (5 min)',
                    '5 invitations VIP + table reservee au gala (5 pers.)',
                    'Participation aux rencontres B2B Premium',
                ],
                'highlight' => true,
            ],
            [
                'name' => 'Pack Or',
                'range' => '7 a 10 millions FCFA',
                'tag' => 'Premium',
                'features' => [
                    'Tous les avantages des Packs Bronze et Argent',
                    'Statut officiel de Partenaire Premium',
                    'Grand stand premium de 36 m2',
                    '8 badges exposants',
                    'Campagne speciale sur LE RURAL TV',
                    '10 invitations VIP + table d\'honneur au gala',
                    'Trophee officiel de reconnaissance',
                    'Certificat de Partenaire Premium',
                ],
                'highlight' => false,
            ],
        ],
        'registration_tabs' => [
            [
                'type' => 'panel',
                'label' => 'Participant au panel',
                'description' => 'Participer en tant que personne physique aux panels et debats du SAFEB.',
                'icon' => 'Users',
                'enabled' => true,
            ],
            [
                'type' => 'partner',
                'label' => 'Partenaire',
                'description' => 'Devenir partenaire officiel : sponsoring, visibilite institutionnelle, terrain et digitale.',
                'icon' => 'Handshake',
                'enabled' => true,
            ],
            [
                'type' => 'stand',
                'label' => 'Reservation de stand',
                'description' => 'Exposer vos produits au sein de la foire et du village gastronomique du salon.',
                'icon' => 'Store',
                'enabled' => true,
            ],
            [
                'type' => 'masterclass',
                'label' => 'Masterclass',
                'description' => 'S\'inscrire aux sessions intensives de renforcement de capacites du SAFEB.',
                'icon' => 'Mic2',
                'enabled' => true,
            ],
            [
                'type' => 'pitch',
                'label' => 'Concours de pitch',
                'description' => 'Presenter votre projet devant un jury d\'investisseurs et d\'experts.',
                'icon' => 'Award',
                'enabled' => true,
            ],
            [
                'type' => 'culinary',
                'label' => 'Concours d\'art culinaire',
                'description' => 'Mettre en valeur votre specialite culinaire traditionnelle beninoise.',
                'icon' => 'Globe2',
                'enabled' => true,
            ],
            [
                'type' => 'film',
                'label' => 'Concours de films',
                'description' => 'Valoriser les parcours inspirants des femmes rurales a travers le cinema.',
                'icon' => 'Film',
                'enabled' => true,
            ],
        ],
        'form_options' => [
            'panel' => [
                'Femme entrepreneure rurale',
                'Jeune femme / Porteuse de projet',
                'Femme leaders communautaire',
                'Beneficiaire de microfinance',
                'Experte / Mentor',
            ],
            'partner' => [
                'Pack Bronze (1 a 3 millions FCFA)',
                'Pack Argent (3 a 7 millions FCFA)',
                'Pack Or (7 a 10 millions FCFA)',
                'Partenariat media',
            ],
            'stand' => [
                'Stand Bronze — 100 000 FCFA',
                'Stand Argent — 250 000 FCFA',
                'Stand Or — 500 000 FCFA',
                'Espace Village Gastronomique — 50 000 FCFA',
            ],
            'masterclass' => [
                'Transformation agroalimentaire',
                'Marketing digital et reseaux sociaux',
                'Gestion financiere et comptabilite',
                'Entrepreneuriat et creation d\'entreprise',
                'Leadership et management',
            ],
        ],
        'composantes' => [
            [
                'icon' => 'Store',
                'title' => 'Foire et exposition',
                'text' => 'Un espace commercial structure : agriculture, transformation agroalimentaire, artisanat, cosmétique naturelle, textile et economie verte.',
            ],
            [
                'icon' => 'Mic2',
                'title' => 'Master class',
                'text' => 'Sessions intensives de renforcement de capacites destinees aux femmes entrepreneures, jeunes filles et porteurs de projets.',
            ],
            [
                'icon' => 'Presentation',
                'title' => 'Panels et conferences',
                'text' => 'Experts nationaux et internationaux, decideurs publics, partenaires techniques et financiers autour des grands enjeux de l\'autonomisation.',
            ],
            [
                'icon' => 'Award',
                'title' => 'Concours de pitch',
                'text' => 'Les meilleures initiatives portees par les femmes rurales presentees devant un jury d\'investisseurs et d\'experts.',
            ],
            [
                'icon' => 'Film',
                'title' => 'Competition de films',
                'text' => 'Valoriser les parcours inspirants des femmes rurales a travers le cinema, le documentaire et les productions audiovisuelles.',
            ],
            [
                'icon' => 'Handshake',
                'title' => 'Rencontres B2B et networking',
                'text' => 'Un espace dedie aux rencontres d\'affaires pour favoriser les partenariats strategiques.',
            ],
            [
                'icon' => 'Globe2',
                'title' => 'Village gastronomique',
                'text' => 'Un espace de decouverte, de degustation et de valorisation du patrimoine culinaire beninois.',
            ],
            [
                'icon' => 'Ticket',
                'title' => 'Concert et soiree de gala',
                'text' => 'Des animations d\'artistes engages pour les questions des femmes.',
            ],
        ],
        'page_text' => [
            'context_title' => 'Un pilier essentiel des economie locales',
            'context_body' => 'Les femmes rurales constituent un pilier essentiel des systemes agroalimentaires en Afrique de l\'Ouest. Au Benin, elles jouent un role determinant dans la production agricole, la transformation et la commercialisation des produits agro-sylvo-pastoraux et halieutiques, ainsi que dans la preservation de la securite alimentaire des menages.',
            'context_body_2' => 'Organise chaque annee a l\'occasion de la Journee internationale des femmes rurales celebree le 15 octobre, le SAFEB contribue a renforcer les capacites entrepreneuriales des femmes rurales et a accroitre leur competitivite sur les marches nationaux et regionaux.',
            'objectives_title' => 'Un cadre privilegie de dialogue',
            'objectives' => [
                'Promouvoir les produits et services des femmes entrepreneures rurales',
                'Renforcer leurs capacites entrepreneuriales et digitales',
                'Faciliter leur acces au financement et aux marches',
                'Valoriser leurs parcours a travers le cinema et les medias',
                'Celebrer et recompenser les femmes inspirantes',
            ],
            'contact_phone' => '+229 01 90 35 04 90',
            'contact_email' => 'plurimediac@gmail.com',
            'contact_address' => 'ABOMEY-CALAVI, Benin',
            'cta_title' => 'Organise par LE RURAL',
            'cta_body' => 'Le SAFEB ambitionne de devenir une plateforme nationale et regionale de reference pour la promotion de l\'entrepreneuriat feminin rural, la creation de partenariats d\'affaires et l\'acces aux opportunites d\'investissement.',
            'cta_footer' => 'Femmes rurales · Institutions · Partenaires techniques et financiers',
        ],
    ];

    /**
     * Affiche la page de configuration SafeB.
     */
    public function index(): Response
    {
        $settings = $this->loadSettings();

        return Inertia::render('Admin/SafebSettings/Index', [
            'settings' => $settings,
        ]);
    }

    /**
     * Met a jour une section de configuration SafeB.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'section' => ['required', 'string', 'in:stats,packs,registration_tabs,form_options,composantes,page_text'],
            'value' => ['required'],
        ]);

        $section = $validated['section'];
        $value = $validated['value'];

        SafebSetting::set("safeb_{$section}", $value);

        return back()->with('success', "Section \"{$section}\" mise a jour avec succes.");
    }

    /**
     * Reinitialise une section aux valeurs par defaut.
     */
    public function reset(string $section)
    {
        $allowedSections = array_keys(self::DEFAULTS);

        if (!in_array($section, $allowedSections, true)) {
            abort(404);
        }

        SafebSetting::where('key', "safeb_{$section}")->delete();

        return back()->with('success', "Section \"{$section}\" reinitialisee aux valeurs par defaut.");
    }

    /**
     * Charge toutes les sections avec fallback sur les defaults.
     */
    private function loadSettings(): array
    {
        $settings = [];

        foreach (self::DEFAULTS as $key => $default) {
            $settings[$key] = SafebSetting::get("safeb_{$key}", $default);
        }

        return $settings;
    }
}
