<?php

namespace Tests\Feature;

use App\Models\SafebRegistration;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SafebPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_safeb_page_is_accessible(): void
    {
        $response = $this->get(route('safeb.index'));

        $response->assertOk();

        $content = $response->getContent();
        $this->assertStringContainsString('SAFEB', $content);
        // L'URL de la brochure est serialisee (JSON-escaped) dans le data-page Inertia :
        // on verifie la presence du nom de route et du chemin de la brochure.
        $this->assertStringContainsString('safeb.pdf', $content);
        $this->assertStringContainsString('brochure.pdf', $content);
    }

    public function test_safeb_registration_as_panel_participant(): void
    {
        $response = $this->post(route('safeb.register'), [
            'type' => 'panel',
            'name' => 'Aminata Dossou',
            'email' => 'aminata@example.com',
            'phone' => '+229 01 90 35 04 90',
            'organization' => 'Coopérative Mêdaho',
            'option_label' => 'Panéliste / conférencier',
            'message' => 'Je souhaite intervenir sur le financement agricole.',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('safeb_registrations', [
            'type' => 'panel',
            'name' => 'Aminata Dossou',
            'email' => 'aminata@example.com',
            'organization' => 'Coopérative Mêdaho',
            'option_label' => 'Panéliste / conférencier',
        ]);
    }

    public function test_safeb_registration_as_partner(): void
    {
        $response = $this->post(route('safeb.register'), [
            'type' => 'partner',
            'name' => 'Banque Agricole',
            'email' => 'partenariat@example.com',
            'organization' => 'Banque Agricole du Bénin',
            'option_label' => 'Pack Argent (3 à 7 millions FCFA)',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('safeb_registrations', [
            'type' => 'partner',
            'name' => 'Banque Agricole',
            'option_label' => 'Pack Argent (3 à 7 millions FCFA)',
        ]);
    }

    public function test_safeb_registration_as_stand_reservation(): void
    {
        $response = $this->post(route('safeb.register'), [
            'type' => 'stand',
            'name' => 'Femmes du Borgou',
            'email' => 'exposants@example.com',
            'organization' => 'Association des transformatrices',
            'option_label' => 'Stand aménagé de 9 m²',
            'message' => 'Nous exposons du soja transformé.',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('safeb_registrations', [
            'type' => 'stand',
            'name' => 'Femmes du Borgou',
            'option_label' => 'Stand aménagé de 9 m²',
        ]);
    }

    public function test_safeb_registration_as_masterclass_participant(): void
    {
        $response = $this->post(route('safeb.register'), [
            'type' => 'masterclass',
            'name' => 'Mariam Bio',
            'email' => 'mariam@example.com',
            'option_label' => 'Digital & e-commerce',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('safeb_registrations', [
            'type' => 'masterclass',
            'name' => 'Mariam Bio',
            'option_label' => 'Digital & e-commerce',
        ]);
    }

    public function test_safeb_registration_for_pitch_contest(): void
    {
        $response = $this->post(route('safeb.register'), [
            'type' => 'pitch',
            'name' => 'Rachida Seko',
            'email' => 'rachida@example.com',
            'option_label' => 'Projet en développement',
            'message' => 'Plateforme de vente de produits transformés.',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('safeb_registrations', [
            'type' => 'pitch',
            'name' => 'Rachida Seko',
            'option_label' => 'Projet en développement',
        ]);
    }

    public function test_safeb_registration_for_culinary_contest(): void
    {
        $response = $this->post(route('safeb.register'), [
            'type' => 'culinary',
            'name' => 'Awa Gnonlonfoun',
            'email' => 'awa@example.com',
            'option_label' => 'Cuisine traditionnelle',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('safeb_registrations', [
            'type' => 'culinary',
            'name' => 'Awa Gnonlonfoun',
            'option_label' => 'Cuisine traditionnelle',
        ]);
    }

    public function test_safeb_registration_form_pages_are_accessible(): void
    {
        foreach (['panel', 'partner', 'stand', 'masterclass', 'pitch', 'culinary'] as $type) {
            $response = $this->get(route('safeb.register.form', $type));

            $response->assertOk();
            $this->assertStringContainsString('SAFEB', $response->getContent());
        }
    }

    public function test_safeb_registration_form_rejects_unknown_type(): void
    {
        $this->get(route('safeb.register.form', 'volunteer'))->assertNotFound();
    }

    public function test_safeb_registration_validates_required_fields(): void
    {
        $response = $this->post(route('safeb.register'), [
            'type' => 'panel',
            'name' => '',
            'email' => 'not-an-email',
        ]);

        $response->assertSessionHasErrors(['name', 'email']);

        $this->assertCount(0, SafebRegistration::all());
    }

    public function test_safeb_registration_rejects_invalid_type(): void
    {
        $response = $this->post(route('safeb.register'), [
            'type' => 'volunteer',
            'name' => 'Test',
            'email' => 'test@example.com',
        ]);

        $response->assertSessionHasErrors(['type']);

        $this->assertCount(0, SafebRegistration::all());
    }

    public function test_safeb_registration_sends_email_to_configured_contact(): void
    {
        Setting::create([
            'key' => 'contact_email',
            'value' => 'safeb@lerural.bj',
        ]);

        \Illuminate\Support\Facades\Mail::fake();

        $response = $this->post(route('safeb.register'), [
            'type' => 'partner',
            'name' => 'Partenaire Test',
            'email' => 'partenaire@example.com',
            'organization' => 'Test Corp',
        ]);

        $response->assertRedirect();

        \Illuminate\Support\Facades\Mail::assertSent(
            \App\Mail\SafebRegistrationReceived::class,
            function ($mail) {
                return $mail->hasTo('safeb@lerural.bj')
                    && $mail->payload['name'] === 'Partenaire Test'
                    && $mail->payload['type'] === 'partner';
            }
        );
    }

    public function test_safeb_pdf_is_downloadable(): void
    {
        $response = $this->get(route('safeb.pdf'));

        $response->assertOk();
        $this->assertStringContainsString('application/pdf', $response->headers->get('Content-Type') ?? '');
        $this->assertStringContainsString(
            'safeb-2026-brochure.pdf',
            $response->headers->get('Content-Disposition') ?? ''
        );
    }
}
