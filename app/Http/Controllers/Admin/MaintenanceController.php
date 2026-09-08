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
     * Creer le schema dans MySQL en y jouant les migrations.
     * SQLite n'est pas touchee et continue de servir le site.
     */
    public function mysqlPrepare(): RedirectResponse
    {
        try {
            Artisan::call('migrate', ['--force' => true, '--database' => 'mysql_target']);

            return back()->with('success', 'Schema MySQL cree. ' . mb_substr(trim(preg_replace('/\s+/', ' ', Artisan::output()) ?? ''), 0, 250));
        } catch (\Throwable $e) {
            report($e);

            return back()->with('error', 'Echec de la preparation MySQL : ' . $e->getMessage());
        }
    }

    /**
     * Copier les donnees vers MySQL, par lots reprenables.
     */
    public function mysqlCopier(\App\Services\SqliteToMysqlService $service): RedirectResponse
    {
        try {
            $resultat = $service->copier();

            return back()->with($resultat['termine'] ? 'success' : 'info', $resultat['message']);
        } catch (\Throwable $e) {
            report($e);

            return back()->with('error', 'Echec de la copie : ' . $e->getMessage());
        }
    }

    /**
     * Comparer SQLite et MySQL, table par table.
     */
    public function mysqlParite(\App\Services\SqliteToMysqlService $service): RedirectResponse
    {
        try {
            $rapport = $service->parite();

            $ecarts = collect($rapport['lignes'])
                ->filter(fn (array $l) => $l['ecart'] !== 0)
                ->map(fn (array $l) => sprintf('%s (sqlite %d / mysql %d)', $l['table'], $l['sqlite'], $l['mysql']))
                ->take(8)
                ->implode(', ');

            if ($rapport['parite']) {
                return back()->with('success', sprintf(
                    'Parite atteinte : %d tables identiques.',
                    count($rapport['lignes'])
                ));
            }

            return back()->with('error', 'Ecarts detectes : ' . $ecarts);
        } catch (\Throwable $e) {
            report($e);

            return back()->with('error', 'Echec du controle : ' . $e->getMessage());
        }
    }

    /**
     * Instantane coherent de la base SQLite.
     *
     * VACUUM INTO est la seule facon d'obtenir une copie saine d'une base
     * ecrite en continu : une copie de fichier prise pendant les ecritures
     * melange deux etats et echoue au controle d'integrite. La copie est
     * ecrite hors du dossier public, jamais accessible par le web.
     */
    public function backup(): RedirectResponse
    {
        try {
            $source = (string) config('database.connections.sqlite.database');

            if (! is_file($source)) {
                return back()->with('error', 'Base introuvable : ' . $source);
            }

            $dossier = dirname($source) . DIRECTORY_SEPARATOR . 'backups';

            if (! is_dir($dossier) && ! @mkdir($dossier, 0755, true) && ! is_dir($dossier)) {
                return back()->with('error', 'Impossible de creer ' . $dossier);
            }

            $cible = $dossier . DIRECTORY_SEPARATOR . 'snapshot-' . now()->format('Ymd-His') . '.sqlite';

            // Connexion dediee : VACUUM ne peut pas s'executer dans une transaction.
            $pdo = new \PDO('sqlite:' . $source);
            $pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
            $pdo->exec('VACUUM INTO ' . $pdo->quote($cible));

            // Verification immediate : une sauvegarde non verifiee n'en est pas une.
            $verif = new \PDO('sqlite:' . $cible);
            $verif->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
            $integrite = $verif->query('PRAGMA integrity_check')->fetchColumn();

            if ($integrite !== 'ok') {
                return back()->with('error', 'Sauvegarde ecrite mais integrite KO : ' . $integrite);
            }

            return back()->with('success', sprintf(
                'Sauvegarde verifiee : %s (%.1f Mo, integrite ok).',
                basename($cible),
                filesize($cible) / 1048576
            ));
        } catch (\Throwable $e) {
            report($e);

            return back()->with('error', 'Echec de la sauvegarde : ' . $e->getMessage());
        }
    }

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
