<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class StaticPage extends Model
{
    protected $fillable = [
        'slug',
        'title',
        'category',
        'content',
        'meta_description',
        'is_published',
        'order',
        'published_at',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'order' => 'integer',
        'published_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::saving(function (StaticPage $page) {
            if (empty($page->slug) && !empty($page->title)) {
                $page->slug = Str::slug($page->title);
            }
        });
    }

    public static function ensureDefaultPages(): void
    {
        $defaults = [
            [
                'slug' => 'mentions-legales',
                'title' => 'Mentions legales',
                'category' => 'legal',
                'order' => 10,
                'content' => '<p>Ajoutez ici vos mentions legales.</p>',
            ],
            [
                'slug' => 'conditions-generales-de-vente',
                'title' => 'Conditions generales de vente',
                'category' => 'legal',
                'order' => 20,
                'content' => '<p>Ajoutez ici vos conditions generales de vente.</p>',
            ],
            [
                'slug' => 'politique-de-confidentialite',
                'title' => 'Politique de confidentialite',
                'category' => 'legal',
                'order' => 30,
                'content' => '<p>Ajoutez ici votre politique de confidentialite.</p>',
            ],
            [
                'slug' => 'gestion-des-cookies',
                'title' => 'Gestion des cookies',
                'category' => 'legal',
                'order' => 40,
                'content' => '<p>Ajoutez ici votre politique de cookies.</p>',
            ],
            [
                'slug' => 'faq',
                'title' => 'FAQ',
                'category' => 'info',
                'order' => 50,
                'content' => '<p>Ajoutez ici votre foire aux questions.</p>',
            ],

            [
                'slug' => 'entreprise',
                'title' => 'Entreprise',
                'category' => 'other',
                'order' => 70,
                'content' => '<p>Ajoutez ici le contenu de la page Entreprise.</p>',
            ],
            [
                'slug' => 'carrieres',
                'title' => 'Carrieres',
                'category' => 'other',
                'order' => 80,
                'content' => '<p>Ajoutez ici le contenu de la page Carrieres.</p>',
            ],
            [
                'slug' => 'opportunites',
                'title' => 'Opportunites',
                'category' => 'other',
                'order' => 90,
                'content' => '<p>Ajoutez ici le contenu de la page Opportunites.</p>',
            ],
            [
                'slug' => 'plurimedia',
                'title' => 'Plurimedia',
                'category' => 'other',
                'order' => 100,
                'content' => '<p>Ajoutez ici le contenu de la page Plurimedia.</p>',
            ],
            [
                'slug' => 'communication',
                'title' => 'Communication',
                'category' => 'other',
                'order' => 110,
                'content' => '<p>Ajoutez ici le contenu de la page Communication.</p>',
            ],
            [
                'slug' => 'eima',
                'title' => 'EIMA',
                'category' => 'other',
                'order' => 120,
                'content' => '<p>Ajoutez ici le contenu de la page EIMA.</p>',
            ],
            [
                'slug' => 'fondation-le-rural',
                'title' => 'Fondation LE RURAL',
                'category' => 'other',
                'order' => 130,
                'content' => '<p>Ajoutez ici le contenu de la page Fondation LE RURAL.</p>',
            ],
        ];

        foreach ($defaults as $page) {
            static::query()->firstOrCreate(
                ['slug' => $page['slug']],
                [
                    'title' => $page['title'],
                    'category' => $page['category'],
                    'content' => $page['content'],
                    'meta_description' => null,
                    'is_published' => true,
                    'order' => $page['order'],
                    'published_at' => now(),
                ]
            );
        }
    }
}
