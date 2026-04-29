<?php

namespace App\Http\Controllers;

use App\Mail\ContactMessageReceived;
use App\Models\Setting;
use App\Models\StaticPage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function contact(): Response
    {
        return Inertia::render('Contact');
    }

    public function submitContact(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'phone' => ['nullable', 'string', 'max:60'],
            'subject' => ['required', 'string', 'max:180'],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
        ]);

        $recipient = Setting::query()
            ->where('key', 'contact_email')
            ->value('value') ?: config('mail.from.address');

        if (empty($recipient)) {
            return back()->with('error', 'Aucune adresse email de reception n\'est configuree.');
        }

        $payload = [
            'name' => trim($validated['name']),
            'email' => trim($validated['email']),
            'phone' => isset($validated['phone']) ? trim((string) $validated['phone']) : '',
            'subject' => trim($validated['subject']),
            'message' => trim($validated['message']),
            'submitted_at' => now()->format('d/m/Y H:i'),
            'ip' => $request->ip(),
        ];

        try {
            Mail::to($recipient)->send(new ContactMessageReceived($payload));
        } catch (\Throwable $exception) {
            report($exception);

            return back()->with('error', 'Envoi impossible pour le moment. Reessayez dans quelques instants.');
        }

        return back()->with('success', 'Votre message a ete envoye avec succes.');
    }

    public function about(): Response
    {
        $page = StaticPage::query()
            ->where('slug', 'a-propos')
            ->where('is_published', true)
            ->first();

        if ($page) {
            return Inertia::render('StaticPage', [
                'page' => $page,
            ]);
        }

        return Inertia::render('About');
    }

    public function show(string $slug): Response|RedirectResponse
    {
        if ($slug === 'contact') {
            return redirect()->route('contact');
        }

        StaticPage::ensureDefaultPages();

        $page = StaticPage::query()
            ->where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        return Inertia::render('StaticPage', [
            'page' => $page,
        ]);
    }
}