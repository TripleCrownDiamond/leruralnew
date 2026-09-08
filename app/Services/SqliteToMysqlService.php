<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Copie des donnees SQLite vers MySQL, puis controle de parite.
 *
 * L'hebergement n'offre ni SSH ni acces MySQL distant : la copie doit tourner
 * sur le serveur, dans le temps imparti a une requete PHP. Elle avance donc par
 * lots et se reprend la ou elle s'est arretee, plutot que de tenter un transfert
 * unique qui expirerait au milieu.
 *
 * La base SQLite n'est jamais modifiee : elle continue de servir le site
 * pendant toute l'operation.
 */
class SqliteToMysqlService
{
    /** Marge de securite sous la limite d'execution PHP. */
    private const BUDGET_SECONDES = 20;

    /** Lignes lues par passe ; au-dela la memoire devient un probleme. */
    private const TAILLE_LOT = 500;

    /**
     * Copier les tables, en reprenant l'avancement precedent.
     *
     * @return array{termine: bool, tables: array<string, array{copiees: int, total: int}>, message: string}
     */
    public function copier(): array
    {
        $depart = microtime(true);
        $avancement = cache()->get('migration:mysql:avancement', []);
        $etat = [];
        $termine = true;

        foreach ($this->tables() as $table) {
            $total = (int) DB::connection('sqlite')->table($table)->count();
            $deja = (int) ($avancement[$table] ?? 0);

            if ($deja >= $total) {
                $etat[$table] = ['copiees' => $deja, 'total' => $total];
                continue;
            }

            if (microtime(true) - $depart > self::BUDGET_SECONDES) {
                $termine = false;
                $etat[$table] = ['copiees' => $deja, 'total' => $total];
                continue;
            }

            $deja = $this->copierTable($table, $deja, $depart);
            $avancement[$table] = $deja;
            $etat[$table] = ['copiees' => $deja, 'total' => $total];

            if ($deja < $total) {
                $termine = false;
            }
        }

        cache()->put('migration:mysql:avancement', $avancement, now()->addDay());

        $copiees = array_sum(array_column($etat, 'copiees'));
        $totales = array_sum(array_column($etat, 'total'));

        return [
            'termine' => $termine,
            'tables' => $etat,
            'message' => $termine
                ? sprintf('Copie terminee : %s lignes sur %s.', number_format($copiees, 0, ',', ' '), number_format($totales, 0, ',', ' '))
                : sprintf('Copie en cours : %s / %s lignes. Relancez pour continuer.', number_format($copiees, 0, ',', ' '), number_format($totales, 0, ',', ' ')),
        ];
    }

    /**
     * Comparer les deux bases table par table.
     *
     * @return array{parite: bool, lignes: array<int, array{table: string, sqlite: int, mysql: int, ecart: int}>}
     */
    public function parite(): array
    {
        $lignes = [];
        $parite = true;

        foreach ($this->tables() as $table) {
            $s = (int) DB::connection('sqlite')->table($table)->count();
            $m = Schema::connection('mysql_target')->hasTable($table)
                ? (int) DB::connection('mysql_target')->table($table)->count()
                : 0;

            if ($s !== $m) {
                $parite = false;
            }

            $lignes[] = ['table' => $table, 'sqlite' => $s, 'mysql' => $m, 'ecart' => $m - $s];
        }

        usort($lignes, fn (array $a, array $b) => $a['ecart'] <=> $b['ecart']);

        return ['parite' => $parite, 'lignes' => $lignes];
    }

    /** Remettre l'avancement a zero pour repartir d'une copie propre. */
    public function reinitialiser(): void
    {
        cache()->forget('migration:mysql:avancement');
    }

    /**
     * Copier une table par lots, en repartant de l'offset atteint.
     */
    private function copierTable(string $table, int $offset, float $depart): int
    {
        if (! Schema::connection('mysql_target')->hasTable($table)) {
            return $offset;
        }

        $colonnes = Schema::connection('mysql_target')->getColumnListing($table);

        while (microtime(true) - $depart <= self::BUDGET_SECONDES) {
            $lot = DB::connection('sqlite')
                ->table($table)
                ->orderBy($this->cleDeTri($table))
                ->offset($offset)
                ->limit(self::TAILLE_LOT)
                ->get();

            if ($lot->isEmpty()) {
                break;
            }

            // On ne garde que les colonnes presentes des deux cotes : un schema
            // legerement decale ne doit pas faire echouer toute la copie.
            $rangees = $lot->map(fn ($r) => array_intersect_key((array) $r, array_flip($colonnes)))->all();

            DB::connection('mysql_target')->table($table)->insertOrIgnore($rangees);

            $offset += $lot->count();

            if ($lot->count() < self::TAILLE_LOT) {
                break;
            }
        }

        return $offset;
    }

    /** Cle de tri stable : sans ordre fixe, la pagination sauterait des lignes. */
    private function cleDeTri(string $table): string
    {
        foreach (['id', 'created_at'] as $candidate) {
            if (Schema::connection('sqlite')->hasColumn($table, $candidate)) {
                return $candidate;
            }
        }

        return Schema::connection('sqlite')->getColumnListing($table)[0];
    }

    /**
     * Tables a copier, hors tables de service de Laravel.
     *
     * @return array<int, string>
     */
    private function tables(): array
    {
        $exclues = ['migrations', 'sessions', 'cache', 'cache_locks', 'jobs', 'job_batches', 'failed_jobs', 'password_reset_tokens'];

        return collect(Schema::connection('sqlite')->getTableListing())
            ->map(fn ($t) => is_array($t) ? ($t['name'] ?? '') : (string) $t)
            ->filter(fn (string $t) => $t !== '' && ! str_starts_with($t, 'sqlite_') && ! in_array($t, $exclues, true))
            ->values()
            ->all();
    }
}
