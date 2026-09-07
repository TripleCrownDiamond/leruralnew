<?php

namespace App\Http\Controllers;

use App\Services\SitemapService;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * Sitemap servi a la demande.
     *
     * Mis en cache une heure : un robot ne doit pas declencher la lecture de
     * l'ensemble des articles a chaque passage, mais le delai reste assez court
     * pour qu'une publication soit soumise le jour meme.
     */
    public function index(SitemapService $sitemap): Response
    {
        $xml = cache()->remember(
            'sitemap:xml',
            now()->addHour(),
            fn () => $sitemap->build()
        );

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
        ]);
    }
}
