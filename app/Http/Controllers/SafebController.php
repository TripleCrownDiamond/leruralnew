<?php

namespace App\Http\Controllers;

use App\Mail\SafebRegistrationReceived;
use App\Models\SafebRegistration;
use App\Models\SafebSetting;
use App\Models\Setting;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SafebController extends Controller
{
    /**
     * Types d'inscription acceptes au SAFEB 2026.
     */
    public const TYPES = [
        'panel',
        'partner',
        'stand',
        'masterclass',
        'pitch',
        'culinary',
        'film',
    ];

    /**
     * Page publique du SAFEB 2026.
     */
    public function index(): Response
    {
        return Inertia::render('Safeb', [
            'pdf_url' => route('safeb.pdf'),
            'safeb_settings' => $this->loadSafebSettings(),
        ]);
    }

    /**
     * Page d'inscription dediee a un type de participation.
     */
    public function registerForm(string $type): Response
    {
        abort_unless(in_array($type, self::TYPES, true), 404);

        return Inertia::render('Safeb/Register', [
            'type' => $type,
            'pdf_url' => route('safeb.pdf'),
        ]);
    }

    /**
     * Enregistre une inscription avec gestion des fichiers uploades.
     */
    public function register(Request $request): RedirectResponse
    {
        $type = $request->input('type');

        $validated = $request->validate([
            'type' => ['required', 'string', 'in:' . implode(',', self::TYPES)],
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:190'],
            'phone' => ['nullable', 'string', 'max:60'],
            'organization' => ['nullable', 'string', 'max:190'],
            'option_label' => ['nullable', 'string', 'max:190'],
            'specialty' => [
                'nullable', 'string', 'max:500',
                // Requis pour culinary (specialite culinaire) et film (titre du film)
            ],
            'message' => ['nullable', 'string', 'max:5000'],
            // Fichiers pour pitch (PDF + images)
            'pitch_files' => ['nullable', 'array', 'max:5'],
            'pitch_files.*' => ['file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'], // 10 MB max par fichier
            // Fichiers pour culinary (video)
            'culinary_files' => ['nullable', 'array', 'max:3'],
            'culinary_files.*' => ['file', 'mimes:mp4,mov,avi,webm', 'max:51200'], // 50 MB max par fichier
            // Fichiers pour film (video)
            'film_files' => ['nullable', 'array', 'max:3'],
            'film_files.*' => ['file', 'mimes:mp4,mov,avi,webm', 'max:51200'], // 50 MB max par fichier
        ]);

        // Validation specifique par type
        if ($type === 'pitch' && empty($validated['pitch_files'])) {
            return back()->withErrors(['pitch_files' => 'Veuillez joindre au moins un fichier (business plan, fiche descriptive...).'])->withInput();
        }

        if ($type === 'culinary' && empty($validated['specialty'])) {
            return back()->withErrors(['specialty' => 'Veuillez indiquer votre specialite culinaire.'])->withInput();
        }

        if ($type === 'film' && empty($validated['specialty'])) {
            return back()->withErrors(['specialty' => 'Veuillez indiquer le titre de votre film.'])->withInput();
        }

        // Gestion des uploads
        $uploadedFiles = [];

        if ($type === 'pitch' && !empty($validated['pitch_files'])) {
            foreach ($validated['pitch_files'] as $file) {
                $path = $file->store('safeb/pitch', 'public');
                $uploadedFiles[] = $path;
            }
        }

        if ($type === 'culinary' && !empty($validated['culinary_files'])) {
            foreach ($validated['culinary_files'] as $file) {
                $path = $file->store('safeb/culinary', 'public');
                $uploadedFiles[] = $path;
            }
        }

        if ($type === 'film' && !empty($validated['film_files'])) {
            foreach ($validated['film_files'] as $file) {
                $path = $file->store('safeb/film', 'public');
                $uploadedFiles[] = $path;
            }
        }

        $registration = SafebRegistration::create([
            'type' => $type,
            'name' => trim($validated['name']),
            'email' => trim($validated['email']),
            'phone' => isset($validated['phone']) ? trim((string) $validated['phone']) : null,
            'organization' => isset($validated['organization']) ? trim((string) $validated['organization']) : null,
            'option_label' => isset($validated['option_label']) ? trim((string) $validated['option_label']) : null,
            'specialty' => isset($validated['specialty']) ? trim((string) $validated['specialty']) : null,
            'message' => isset($validated['message']) ? trim((string) $validated['message']) : null,
            'files' => !empty($uploadedFiles) ? $uploadedFiles : null,
            'ip_address' => $request->ip(),
        ]);

        // Envoi de l'email a l'admin
        $recipient = Setting::query()
            ->where('key', 'contact_email')
            ->value('value') ?: config('mail.from.address');

        if (!empty($recipient)) {
            try {
                Mail::to($recipient)->send(new SafebRegistrationReceived([
                    'type' => $registration->type,
                    'name' => $registration->name,
                    'email' => $registration->email,
                    'phone' => $registration->phone,
                    'organization' => $registration->organization,
                    'option_label' => $registration->option_label,
                    'specialty' => $registration->specialty,
                    'message' => $registration->message,
                    'files_count' => count($registration->files ?? []),
                    'submitted_at' => now()->format('d/m/Y H:i'),
                ]));
            } catch (\Throwable $exception) {
                report($exception);
            }
        }

        $messages = [
            'panel' => 'Merci pour votre inscription au SAFEB 2026. Nous reviendrons vers vous pour confirmer votre participation.',
            'partner' => 'Merci pour votre demande de partenariat SAFEB 2026. Notre equipe vous contactera tres prochainement.',
            'stand' => 'Merci pour votre demande de reservation de stand. L\'equipe SAFEB 2026 vous contactera pour confirmer votre emplacement.',
            'masterclass' => 'Merci pour votre inscription a la masterclass SAFEB 2026. Nous reviendrons vers vous avec le programme detaille des sessions.',
            'pitch' => 'Merci pour votre inscription au concours de pitch SAFEB 2026. Vos documents ont ete recus. Les consignes de candidature vous seront transmises prochainement.',
            'culinary' => 'Merci pour votre inscription au concours d\'art culinaire SAFEB 2026. Votre specialite et vos videos ont ete recus. Nous vous contacterons pour la confirmation.',
            'film' => 'Merci pour votre inscription au concours de films SAFEB 2026. Votre film a ete recu. Nous vous contacterons pour la suite du processus.',
        ];

        return back()->with('success', $messages[$registration->type] ?? 'Merci pour votre inscription au SAFEB 2026.');
    }

    /**
     * Telecharge la brochure officielle SAFEB 2026 au format PDF.
     */
    public function downloadPdf()
    {
        $file = storage_path('app/brochures/safeb-2026-brochure.pdf');

        if (is_file($file)) {
            return response()->download($file, 'safeb-2026-brochure.pdf', [
                'Content-Type' => 'application/pdf',
            ]);
        }

        $pdf = Pdf::loadView('pdf.safeb-brochure');

        return $pdf->download('safeb-2026-brochure.pdf');
    }

    /**
     * Charge les parametres SafeB depuis la base de donnees.
     */
    private function loadSafebSettings(): array
    {
        return [
            'stats' => SafebSetting::get('safeb_stats'),
            'packs' => SafebSetting::get('safeb_packs'),
            'registration_tabs' => SafebSetting::get('safeb_registration_tabs'),
            'form_options' => SafebSetting::get('safeb_form_options'),
            'composantes' => SafebSetting::get('safeb_composantes'),
            'page_text' => SafebSetting::get('safeb_page_text'),
        ];
    }
}
