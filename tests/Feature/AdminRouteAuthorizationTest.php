<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminRouteAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_login_for_admin_dashboard_routes(): void
    {
        foreach ($this->adminOnlyUris() as $uri) {
            $this->get($uri)->assertRedirect(route('login'));
        }
    }

    public function test_subscriber_and_client_accounts_cannot_access_admin_routes(): void
    {
        foreach ([User::ROLE_USER, User::ROLE_CLIENT] as $role) {
            $user = User::factory()->create([
                'role' => $role,
                'email_verified_at' => now(),
            ]);

            foreach ($this->adminOnlyUris() as $uri) {
                $this->actingAs($user)
                    ->get($uri)
                    ->assertRedirect(route('dashboard'))
                    ->assertSessionHas('error');
            }
        }
    }

    public function test_editor_can_access_article_management_but_not_admin_modules(): void
    {
        $editor = User::factory()->create([
            'role' => User::ROLE_EDITOR,
            'email_verified_at' => now(),
        ]);

        $this->actingAs($editor)
            ->get(route('dashboard.articles.index'))
            ->assertOk();

        foreach ($this->adminOnlyUris() as $uri) {
            $this->actingAs($editor)
                ->get($uri)
                ->assertRedirect(route('dashboard'))
                ->assertSessionHas('error');
        }
    }

    public function test_admin_can_access_admin_routes(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'email_verified_at' => now(),
        ]);

        foreach ($this->adminOnlyUris() as $uri) {
            $this->actingAs($admin)
                ->get($uri)
                ->assertOk();
        }
    }

    private function adminOnlyUris(): array
    {
        return [
            route('dashboard.polls.index'),
            route('dashboard.users.index'),
            route('dashboard.announcements.index'),
            route('dashboard.widgets.index'),
            route('dashboard.settings.socials'),
        ];
    }
}