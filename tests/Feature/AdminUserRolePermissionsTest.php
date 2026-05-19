<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserRolePermissionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_assigns_role_permissions_automatically(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($admin)->post(route('dashboard.users.store'), [
            'name' => 'Jean Redac',
            'email' => 'jean-redac@example.com',
            'role' => 'editor',
            'permissions' => [],
            'send_invitation' => false,
        ]);

        $response->assertRedirect(route('dashboard.users.index'));

        $created = User::where('email', 'jean-redac@example.com')->firstOrFail();

        $this->assertSame(['create_articles', 'edit_articles', 'manage_own_content', 'view_content', 'comment'], $created->permissions);
    }

    public function test_update_merges_role_permissions_with_manual_extras(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'email_verified_at' => now(),
        ]);

        $user = User::factory()->create([
            'role' => User::ROLE_USER,
            'permissions' => ['view_content'],
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($admin)->patch(route('dashboard.users.update', $user), [
            'name' => 'Jean Redac',
            'email' => $user->email,
            'role' => 'editor',
            'permissions' => ['manage_categories'],
            'status' => 'active',
            'send_notification' => false,
        ]);

        $response->assertRedirect(route('dashboard.users.edit', $user));

        $user->refresh();

        $this->assertSame([
            'create_articles',
            'edit_articles',
            'manage_own_content',
            'view_content',
            'comment',
            'manage_categories',
        ], $user->permissions);
    }

    public function test_update_does_not_change_user_name_or_email_from_admin_screen(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'email_verified_at' => now(),
        ]);

        $user = User::factory()->create([
            'role' => User::ROLE_USER,
            'name' => 'Nom initial',
            'email' => 'initial@example.com',
            'email_verified_at' => now(),
        ]);

        $this->actingAs($admin)->patch(route('dashboard.users.update', $user), [
            'name' => 'Nom tente',
            'email' => 'change@example.com',
            'role' => 'editor',
            'permissions' => [],
            'status' => 'active',
            'send_notification' => false,
        ])->assertRedirect(route('dashboard.users.edit', $user));

        $user->refresh();

        $this->assertSame('Nom initial', $user->name);
        $this->assertSame('initial@example.com', $user->email);
    }
}
