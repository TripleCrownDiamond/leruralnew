<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Artisan;

/**
 * Operations de maintenance declenchables depuis l'administration.
 *
 * L'hebergement ne donne pas d'acces SSH : sans cela, une migration ne peut
 * etre appliquee qu'en rapatriant la base entiere, ce qui est impraticable
 * sur une base ecrite en permanence — la copie obtenue est incoherente.
 */
class MaintenanceController extends Controller
{
    /**
     * Appliquer les migrations en attente.
     *
     * L'operation est idempotente : les migrations deja passees sont ignorees.
     */
    public function migrate(): RedirectResponse
    {
        try {
            Artisan::call('migrate', ['--force' => true]);

            $sortie = trim(preg_replace('/\s+/', ' ', Artisan::output()) ?? '');

            return back()->with(
                'success',
                'Migrations appliquees. ' . mb_substr($sortie, 0, 300)
            );
        } catch (\Throwable $e) {
            report($e);

            return back()->with('error', 'Echec des migrations : ' . $e->getMessage());
        }
    }
}
