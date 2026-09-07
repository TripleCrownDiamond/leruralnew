<?php

namespace App\Services;

use App\Models\Article;

/**
 * Note de referencement d'un article.
 *
 * Chaque controle vaut un poids ; la note est le pourcentage de poids obtenus.
 * Un controle qui echoue porte le conseil correspondant, de sorte que la
 * redaction sache quoi corriger sans connaitre les regles par coeur.
 */
class SeoScoreService
{
    /** Longueurs recommandees, en caracteres. */
    private const TITRE_MIN = 30;
    private const TITRE_MAX = 60;
    private const DESCRIPTION_MIN = 120;
    private const DESCRIPTION_MAX = 160;
    private const SLUG_MAX = 75;
    private const MOTS_MIN = 300;

    /**
     * @return array{score: int, niveau: string, obtenus: int, total: int, checks: array<int, array{cle: string, libelle: string, ok: bool, poids: int, conseil: string}>}
     */
    public function analyse(Article $article, string $locale = 'fr'): array
    {
        $titre = trim((string) ($article->{'title_' . $locale} ?? ''));
        $metaTitre = trim((string) ($article->meta_title ?? ''));
        $metaDescription = trim((string) ($article->meta_description ?? ''));
        $motCle = mb_strtolower(trim((string) ($article->focus_keyword ?? '')));
        $slug = trim((string) ($article->slug ?? ''));
        $extrait = trim((string) ($article->{'excerpt_' . $locale} ?? ''));
        $contenuHtml = (string) ($article->{'content_' . $locale} ?? '');
        $contenuTexte = trim(preg_replace('/\s+/u', ' ', strip_tags($contenuHtml)) ?? '');

        $nbMots = $contenuTexte === '' ? 0 : count(preg_split('/\s+/u', $contenuTexte) ?: []);
        $titreEffectif = $metaTitre !== '' ? $metaTitre : $titre;
        $longueurTitre = mb_strlen($titreEffectif);
        $longueurDescription = mb_strlen($metaDescription);
        $debutContenu = mb_strtolower(mb_substr($contenuTexte, 0, 600));

        $checks = [
            [
                'cle' => 'meta_title',
                'libelle' => 'Titre SEO renseigne',
                'ok' => $metaTitre !== '',
                'poids' => 10,
                'conseil' => "Ajoutez un titre SEO : sans lui, le moteur reprend le titre de l'article, rarement optimal.",
            ],
            [
                'cle' => 'longueur_titre',
                'libelle' => 'Longueur du titre (' . self::TITRE_MIN . '-' . self::TITRE_MAX . ' caracteres)',
                'ok' => $longueurTitre >= self::TITRE_MIN && $longueurTitre <= self::TITRE_MAX,
                'poids' => 10,
                'conseil' => $longueurTitre < self::TITRE_MIN
                    ? 'Titre trop court (' . $longueurTitre . ' caracteres) : etoffez-le jusqu a ' . self::TITRE_MIN . ' au moins.'
                    : 'Titre trop long (' . $longueurTitre . ' caracteres) : au-dela de ' . self::TITRE_MAX . ' il est tronque dans les resultats.',
            ],
            [
                'cle' => 'meta_description',
                'libelle' => 'Meta description renseignee',
                'ok' => $metaDescription !== '',
                'poids' => 12,
                'conseil' => 'Redigez une meta description : c est le texte affiche sous le titre dans les resultats de recherche.',
            ],
            [
                'cle' => 'longueur_description',
                'libelle' => 'Longueur de la description (' . self::DESCRIPTION_MIN . '-' . self::DESCRIPTION_MAX . ' caracteres)',
                'ok' => $longueurDescription >= self::DESCRIPTION_MIN && $longueurDescription <= self::DESCRIPTION_MAX,
                'poids' => 8,
                'conseil' => $longueurDescription < self::DESCRIPTION_MIN
                    ? 'Description trop courte (' . $longueurDescription . ' caracteres) : visez ' . self::DESCRIPTION_MIN . ' a ' . self::DESCRIPTION_MAX . '.'
                    : 'Description trop longue (' . $longueurDescription . ' caracteres) : elle sera coupee au-dela de ' . self::DESCRIPTION_MAX . '.',
            ],
            [
                'cle' => 'mot_cle',
                'libelle' => 'Mot-cle principal defini',
                'ok' => $motCle !== '',
                'poids' => 10,
                'conseil' => 'Definissez le mot-cle principal : c est la requete sur laquelle vous voulez ressortir.',
            ],
            [
                'cle' => 'mot_cle_titre',
                'libelle' => 'Mot-cle present dans le titre',
                'ok' => $motCle !== '' && str_contains(mb_strtolower($titreEffectif), $motCle),
                'poids' => 10,
                'conseil' => 'Placez le mot-cle dans le titre, de preference vers le debut.',
            ],
            [
                'cle' => 'mot_cle_chapeau',
                'libelle' => 'Mot-cle present dans les premiers paragraphes',
                'ok' => $motCle !== '' && str_contains($debutContenu, $motCle),
                'poids' => 8,
                'conseil' => 'Reprenez le mot-cle des les premieres lignes du corps de l article.',
            ],
            [
                'cle' => 'longueur_contenu',
                'libelle' => 'Contenu d au moins ' . self::MOTS_MIN . ' mots',
                'ok' => $nbMots >= self::MOTS_MIN,
                'poids' => 12,
                'conseil' => 'Article court (' . $nbMots . ' mots) : en dessous de ' . self::MOTS_MIN . ' mots, il se positionne difficilement.',
            ],
            [
                'cle' => 'sous_titres',
                'libelle' => 'Sous-titres (h2 ou h3) dans le contenu',
                'ok' => preg_match('/<h[23][\s>]/i', $contenuHtml) === 1,
                'poids' => 8,
                'conseil' => 'Structurez avec des sous-titres : ils guident la lecture et le referencement.',
            ],
            [
                'cle' => 'image',
                'libelle' => 'Image de couverture',
                'ok' => trim((string) ($article->featured_image ?? '')) !== '',
                'poids' => 8,
                'conseil' => 'Ajoutez une image de couverture : elle sert aussi d apercu lors des partages.',
            ],
            [
                'cle' => 'alt_images',
                'libelle' => 'Textes alternatifs sur les images du contenu',
                'ok' => preg_match('/<img(?![^>]*\balt\s*=\s*["\'][^"\']+["\'])[^>]*>/i', $contenuHtml) !== 1,
                'poids' => 6,
                'conseil' => 'Une image au moins n a pas d attribut alt : indispensable pour l accessibilite et l indexation.',
            ],
            [
                'cle' => 'extrait',
                'libelle' => 'Chapeau renseigne',
                'ok' => $extrait !== '',
                'poids' => 4,
                'conseil' => 'Renseignez le chapeau : il sert de resume sur les pages de liste.',
            ],
            [
                'cle' => 'slug',
                'libelle' => 'Adresse courte et lisible',
                'ok' => $slug !== '' && mb_strlen($slug) <= self::SLUG_MAX,
                'poids' => 4,
                'conseil' => 'Raccourcissez l adresse de la page : au-dela de ' . self::SLUG_MAX . ' caracteres elle devient illisible.',
            ],
        ];

        $total = array_sum(array_column($checks, 'poids'));
        $obtenus = array_sum(array_map(fn (array $c) => $c['ok'] ? $c['poids'] : 0, $checks));
        $score = $total > 0 ? (int) round(($obtenus / $total) * 100) : 0;

        return [
            'score' => $score,
            'niveau' => $this->niveau($score),
            'obtenus' => $obtenus,
            'total' => $total,
            'checks' => $checks,
        ];
    }

    /** Note synthetique, sans le detail des controles. */
    public function score(Article $article, string $locale = 'fr'): int
    {
        return $this->analyse($article, $locale)['score'];
    }

    private function niveau(int $score): string
    {
        return match (true) {
            $score >= 80 => 'bon',
            $score >= 55 => 'moyen',
            default => 'faible',
        };
    }
}
