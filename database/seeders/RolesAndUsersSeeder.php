<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RolesAndUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin
        User::updateOrCreate(
            ['email' => 'admin@lerural.bj'],
            [
                'name' => 'Admin Le Rural',
                'password' => Hash::make('Azerty%1234#1234'),
                'role' => User::ROLE_ADMIN,
                'email_verified_at' => now(),
            ]
        );

        // Editor
        User::updateOrCreate(
            ['email' => 'editor@lerural.bj'],
            [
                'name' => 'Rédacteur Chef',
                'password' => Hash::make('Azerty%1234#1234'),
                'role' => User::ROLE_EDITOR,
                'email_verified_at' => now(),
            ]
        );

        // Client
        User::updateOrCreate(
            ['email' => 'client@lerural.bj'],
            [
                'name' => 'Client Premium',
                'password' => Hash::make('Azerty%1234#1234'),
                'role' => User::ROLE_CLIENT,
                'email_verified_at' => now(),
            ]
        );

        // User
        User::updateOrCreate(
            ['email' => 'user@lerural.bj'],
            [
                'name' => 'Utilisateur Standard',
                'password' => Hash::make('Azerty%1234#1234'),
                'role' => User::ROLE_USER,
                'email_verified_at' => now(),
            ]
        );
    }
}
