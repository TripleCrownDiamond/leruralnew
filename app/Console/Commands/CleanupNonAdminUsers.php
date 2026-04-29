<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CleanupNonAdminUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:cleanup-non-admins {--force : Force la suppression sans confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Supprime tous les utilisateurs sauf les admins';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Compter les utilisateurs non-admins
        $nonAdminCount = DB::table('users')
            ->where('role', '!=', 'admin')
            ->count();

        $adminCount = DB::table('users')
            ->where('role', 'admin')
            ->count();

        $this->info("Utilisateurs trouvés :");
        $this->info("- Admins : {$adminCount}");
        $this->info("- Non-admins : {$nonAdminCount}");
        $this->line("");

        if ($nonAdminCount === 0) {
            $this->info("Aucun utilisateur non-admin à supprimer.");
            return Command::SUCCESS;
        }

        // Demander confirmation
        if (!$this->option('force')) {
            if (!$this->confirm("Êtes-vous sûr de vouloir supprimer les {$nonAdminCount} utilisateurs non-admins ? Cette action est IRREVERSIBLE !")) {
                $this->info("Opération annulée.");
                return Command::SUCCESS;
            }
        }

        // Afficher les utilisateurs qui vont être supprimés
        $usersToDelete = DB::table('users')
            ->where('role', '!=', 'admin')
            ->select('id', 'name', 'email', 'role', 'created_at')
            ->get();

        $this->table(
            ['ID', 'Nom', 'Email', 'Rôle', 'Créé le'],
            $usersToDelete->map(function ($user) {
                return [
                    $user->id,
                    $user->name,
                    $user->email,
                    $user->role,
                    $user->created_at
                ];
            })->toArray()
        );

        $this->line("");

        // Supprimer les permissions associées d'abord
        $deletedPermissions = DB::table('user_permissions')
            ->whereNotIn('user_id', function($query) {
                $query->select('id')->from('users')->where('role', 'admin');
            })
            ->delete();

        // Supprimer les utilisateurs non-admins
        $deletedUsers = DB::table('users')
            ->where('role', '!=', 'admin')
            ->delete();

        $this->info("✅ Suppression terminée !");
        $this->info("- {$deletedUsers} utilisateurs supprimés");
        $this->info("- {$deletedPermissions} permissions supprimées");
        $this->info("- {$adminCount} admins conservés");

        return Command::SUCCESS;
    }
}
