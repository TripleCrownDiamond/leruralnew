<?php

namespace App\Http\Controllers;

use App\Models\PageView;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * Reception du temps passe sur une page, envoye par le navigateur au moment
 * de quitter celle-ci (sendBeacon).
 */
class PageTimeController extends Controller
{
    /** Au-dela, il s'agit d'un onglet laisse ouvert, pas d'une lecture. */
    private const DUREE_MAX = 3600;

    public function store(Request $request): Response
    {
        $data = $request->validate([
            'id' => ['required', 'integer', 'min:1'],
            'seconds' => ['required', 'numeric', 'min:1'],
        ]);

        $secondes = min((int) $data['seconds'], self::DUREE_MAX);

        // Une seule ecriture par visite : un second envoi (retour arriere,
        // onglet restaure) ne doit pas ecraser la mesure initiale.
        PageView::query()
            ->whereKey($data['id'])
            ->whereNull('duration_seconds')
            ->update(['duration_seconds' => $secondes]);

        // Reponse vide : sendBeacon ne lit rien, autant ne rien serialiser.
        return response()->noContent();
    }
}
