<?php

namespace Tests\Feature;

use App\Mail\SafebRegistrationConfirmed;
use App\Models\SafebRegistration;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AdminSafebRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_login(): void
    {
        $this->get(route('dashboard.safeb-registrations.index'))
            ->assertRedirect(route('login'));
    }

    public function test_editor_cannot_access_safeb_registration_management(): void
    {
        $editor = User::factory()->create([
            'role' => User::ROLE_EDITOR,
            'email_verified_at' => now(),
        ]);

        $this->actingAs($editor)
            ->get(route('dashboard.safeb-registrations.index'))
            ->assertRedirect(route('dashboard'))
            ->assertSessionHas('error');
    }

    public function test_editor_cannot_use_bulk_actions(): void
    {
        $editor = User::factory()->create([
            'role' => User::ROLE_EDITOR,
            'email_verified_at' => now(),
        ]);

        $this->actingAs($editor)
            ->post(route('dashboard.safeb-registrations.bulk-status'), [
                'registration_ids' => [1, 2],
                'status' => 'confirmed',
            ])
            ->assertRedirect(route('dashboard'))
            ->assertSessionHas('error');

        $this->actingAs($editor)
            ->post(route('dashboard.safeb-registrations.bulk-delete'), [
                'registration_ids' => [1, 2],
            ])
            ->assertRedirect(route('dashboard'))
            ->assertSessionHas('error');
    }

    public function test_admin_can_bulk_change_status_to_contacted(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'email_verified_at' => now(),
        ]);

        $first = SafebRegistration::create([
            'type' => 'panel',
            'name' => 'Awa Hounkpe',
            'email' => 'awa@example.com',
            'status' => 'new',
        ]);

        $second = SafebRegistration::create([
            'type' => 'stand',
            'name' => 'Jean Dossou',
            'email' => 'jean@example.com',
            'status' => 'new',
        ]);

        $this->actingAs($admin)
            ->post(route('dashboard.safeb-registrations.bulk-status'), [
                'registration_ids' => [$first->id, $second->id],
                'status' => 'contacted',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('safeb_registrations', ['id' => $first->id, 'status' => 'contacted']);
        $this->assertDatabaseHas('safeb_registrations', ['id' => $second->id, 'status' => 'contacted']);
    }

    public function test_admin_can_bulk_reset_status_to_new(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'email_verified_at' => now(),
        ]);

        $contacted = SafebRegistration::create([
            'type' => 'panel',
            'name' => 'Awa Hounkpe',
            'email' => 'awa@example.com',
            'status' => 'contacted',
        ]);

        $confirmed = SafebRegistration::create([
            'type' => 'stand',
            'name' => 'Jean Dossou',
            'email' => 'jean@example.com',
            'status' => 'confirmed',
        ]);

        $this->actingAs($admin)
            ->post(route('dashboard.safeb-registrations.bulk-status'), [
                'registration_ids' => [$contacted->id, $confirmed->id],
                'status' => 'new',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('safeb_registrations', ['id' => $contacted->id, 'status' => 'new']);
        $this->assertDatabaseHas('safeb_registrations', ['id' => $confirmed->id, 'status' => 'new']);
    }

    public function test_bulk_confirm_sends_confirmation_emails_to_newly_confirmed(): void
    {
        Mail::fake();

        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'email_verified_at' => now(),
        ]);

        $first = SafebRegistration::create([
            'type' => 'panel',
            'name' => 'Awa Hounkpe',
            'email' => 'awa@example.com',
            'status' => 'new',
        ]);

        $second = SafebRegistration::create([
            'type' => 'partner',
            'name' => 'BAT Benin',
            'email' => 'contact@batbenin.bj',
            'status' => 'contacted',
        ]);

        // Deja confirmee : aucun email ne doit partir pour elle.
        $alreadyConfirmed = SafebRegistration::create([
            'type' => 'stand',
            'name' => 'Jean Dossou',
            'email' => 'jean@example.com',
            'status' => 'confirmed',
        ]);

        $this->actingAs($admin)
            ->post(route('dashboard.safeb-registrations.bulk-status'), [
                'registration_ids' => [$first->id, $second->id, $alreadyConfirmed->id],
                'status' => 'confirmed',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        Mail::assertSent(SafebRegistrationConfirmed::class, 2);
        Mail::assertSent(SafebRegistrationConfirmed::class, function ($mail) use ($first) {
            return $mail->hasTo($first->email) && $mail->payload['name'] === 'Awa Hounkpe';
        });
        Mail::assertSent(SafebRegistrationConfirmed::class, function ($mail) use ($second) {
            return $mail->hasTo($second->email) && $mail->payload['type'] === 'partner';
        });
    }

    public function test_bulk_status_rejects_invalid_status(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'email_verified_at' => now(),
        ]);

        $registration = SafebRegistration::create([
            'type' => 'panel',
            'name' => 'Awa Hounkpe',
            'email' => 'awa@example.com',
            'status' => 'new',
        ]);

        $this->actingAs($admin)
            ->post(route('dashboard.safeb-registrations.bulk-status'), [
                'registration_ids' => [$registration->id],
                'status' => 'archived',
            ])
            ->assertSessionHasErrors('status');

        $this->assertDatabaseHas('safeb_registrations', ['id' => $registration->id, 'status' => 'new']);
    }

    public function test_admin_can_bulk_delete_registrations(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'email_verified_at' => now(),
        ]);

        $first = SafebRegistration::create([
            'type' => 'panel',
            'name' => 'Awa Hounkpe',
            'email' => 'awa@example.com',
            'status' => 'new',
        ]);

        $second = SafebRegistration::create([
            'type' => 'stand',
            'name' => 'Jean Dossou',
            'email' => 'jean@example.com',
            'status' => 'new',
        ]);

        $third = SafebRegistration::create([
            'type' => 'partner',
            'name' => 'BAT Benin',
            'email' => 'contact@batbenin.bj',
            'status' => 'new',
        ]);

        $this->actingAs($admin)
            ->post(route('dashboard.safeb-registrations.bulk-delete'), [
                'registration_ids' => [$first->id, $second->id],
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('safeb_registrations', ['id' => $first->id]);
        $this->assertDatabaseMissing('safeb_registrations', ['id' => $second->id]);
        $this->assertDatabaseHas('safeb_registrations', ['id' => $third->id]);
    }

    public function test_admin_can_view_registrations_with_filters(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'email_verified_at' => now(),
        ]);

        SafebRegistration::create([
            'type' => 'panel',
            'name' => 'Awa Hounkpe',
            'email' => 'awa@example.com',
            'phone' => '+229 01 02 03 04',
            'organization' => 'Coop Femmes de Parakou',
            'option_label' => 'Panel Autonomisation economique',
            'message' => 'Interessee par le panel.',
            'status' => 'new',
        ]);

        SafebRegistration::create([
            'type' => 'stand',
            'name' => 'Jean Dossou',
            'email' => 'jean@example.com',
            'organization' => 'BAT Benin',
            'option_label' => 'Stand Premium (10m²)',
            'status' => 'contacted',
        ]);

        $this->actingAs($admin)
            ->get(route('dashboard.safeb-registrations.index'))
            ->assertOk();

        $this->actingAs($admin)
            ->get(route('dashboard.safeb-registrations.index', ['type' => 'stand']))
            ->assertOk();

        $this->actingAs($admin)
            ->get(route('dashboard.safeb-registrations.index', ['status' => 'new']))
            ->assertOk();

        $this->actingAs($admin)
            ->get(route('dashboard.safeb-registrations.index', ['search' => 'Dossou']))
            ->assertOk();
    }

    public function test_admin_can_update_registration_status(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'email_verified_at' => now(),
        ]);

        $registration = SafebRegistration::create([
            'type' => 'partner',
            'name' => 'Marina Kiki',
            'email' => 'marina@example.com',
            'status' => 'new',
        ]);

        $this->actingAs($admin)
            ->patch(route('dashboard.safeb-registrations.update', $registration), [
                'status' => 'confirmed',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('safeb_registrations', [
            'id' => $registration->id,
            'status' => 'confirmed',
        ]);
    }

    public function test_update_rejects_invalid_status(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'email_verified_at' => now(),
        ]);

        $registration = SafebRegistration::create([
            'type' => 'panel',
            'name' => 'Awa Hounkpe',
            'email' => 'awa@example.com',
            'status' => 'new',
        ]);

        $this->actingAs($admin)
            ->patch(route('dashboard.safeb-registrations.update', $registration), [
                'status' => 'archived',
            ])
            ->assertSessionHasErrors('status');

        $this->assertDatabaseHas('safeb_registrations', [
            'id' => $registration->id,
            'status' => 'new',
        ]);
    }

    public function test_admin_can_delete_registration(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'email_verified_at' => now(),
        ]);

        $registration = SafebRegistration::create([
            'type' => 'stand',
            'name' => 'Jean Dossou',
            'email' => 'jean@example.com',
            'status' => 'new',
        ]);

        $this->actingAs($admin)
            ->delete(route('dashboard.safeb-registrations.destroy', $registration))
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('safeb_registrations', ['id' => $registration->id]);
    }

    public function test_confirmation_email_is_sent_when_status_becomes_confirmed(): void
    {
        Mail::fake();

        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'email_verified_at' => now(),
        ]);

        $registration = SafebRegistration::create([
            'type' => 'panel',
            'name' => 'Awa Hounkpe',
            'email' => 'awa@example.com',
            'organization' => 'Coop Femmes de Parakou',
            'option_label' => 'Panel Autonomisation economique',
            'status' => 'new',
        ]);

        $this->actingAs($admin)
            ->patch(route('dashboard.safeb-registrations.update', $registration), [
                'status' => 'confirmed',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        Mail::assertSent(SafebRegistrationConfirmed::class, function ($mail) use ($registration) {
            return $mail->hasTo($registration->email)
                && $mail->payload['name'] === 'Awa Hounkpe'
                && $mail->payload['type'] === 'panel';
        });
    }

    public function test_confirmation_email_is_sent_when_confirmed_after_contacted(): void
    {
        Mail::fake();

        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'email_verified_at' => now(),
        ]);

        $registration = SafebRegistration::create([
            'type' => 'stand',
            'name' => 'Jean Dossou',
            'email' => 'jean@example.com',
            'status' => 'contacted',
        ]);

        $this->actingAs($admin)
            ->patch(route('dashboard.safeb-registrations.update', $registration), [
                'status' => 'confirmed',
            ])
            ->assertRedirect();

        Mail::assertSent(SafebRegistrationConfirmed::class, function ($mail) use ($registration) {
            return $mail->hasTo($registration->email)
                && $mail->payload['type'] === 'stand';
        });
    }

    public function test_confirmation_email_is_not_sent_on_other_status_changes(): void
    {
        Mail::fake();

        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'email_verified_at' => now(),
        ]);

        $registration = SafebRegistration::create([
            'type' => 'stand',
            'name' => 'Jean Dossou',
            'email' => 'jean@example.com',
            'status' => 'new',
        ]);

        $this->actingAs($admin)
            ->patch(route('dashboard.safeb-registrations.update', $registration), [
                'status' => 'contacted',
            ])
            ->assertRedirect();

        Mail::assertNothingSent();
    }

    public function test_confirmation_email_is_not_sent_when_already_confirmed(): void
    {
        Mail::fake();

        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'email_verified_at' => now(),
        ]);

        $registration = SafebRegistration::create([
            'type' => 'partner',
            'name' => 'BAT Benin',
            'email' => 'contact@batbenin.bj',
            'status' => 'confirmed',
        ]);

        // Re-confirmer une inscription deja confirmee ne renvoie pas d'email.
        $this->actingAs($admin)
            ->patch(route('dashboard.safeb-registrations.update', $registration), [
                'status' => 'confirmed',
            ])
            ->assertRedirect();

        Mail::assertNothingSent();
    }

    public function test_admin_can_export_registrations_as_csv(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'email_verified_at' => now(),
        ]);

        SafebRegistration::create([
            'type' => 'partner',
            'name' => 'BAT Benin',
            'email' => 'contact@batbenin.bj',
            'phone' => '+229 90 00 00 00',
            'organization' => 'BAT Benin',
            'option_label' => 'Pack Argent',
            'message' => 'Partenariat media.',
            'status' => 'new',
        ]);

        $response = $this->actingAs($admin)
            ->get(route('dashboard.safeb-registrations.export'))
            ->assertOk()
            ->assertHeader('Content-Type', 'text/csv; charset=UTF-8')
            ->assertHeader('Content-Disposition', 'attachment; filename="safeb-inscriptions.csv"');

        $content = $response->streamedContent();

        $this->assertStringContainsString('BAT Benin', $content);
        $this->assertStringContainsString('Pack Argent', $content);
        $this->assertStringContainsString('Partenaire', $content);

        // L'export respecte les filtres courants.
        $filtered = $this->actingAs($admin)
            ->get(route('dashboard.safeb-registrations.export', ['type' => 'panel']))
            ->assertOk();

        $this->assertStringNotContainsString('BAT Benin', $filtered->streamedContent());
    }
}
