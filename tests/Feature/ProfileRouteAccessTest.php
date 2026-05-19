<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileRouteAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_users_can_open_the_profile_page_from_their_account_menu(): void
    {
        foreach ([User::ROLE_ADMIN, User::ROLE_EDITOR, User::ROLE_CLIENT, User::ROLE_USER] as $role) {
            $user = User::factory()->create([
                'role' => $role,
                'email_verified_at' => now(),
            ]);

            $this->actingAs($user)
                ->get(route('profile.edit'))
                ->assertOk();
        }
    }
}
