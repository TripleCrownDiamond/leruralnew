<?php

namespace App\Http\Controllers\Admin;

use App\Mail\SafebRegistrationConfirmed;
use App\Models\SafebRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SafebRegistrationController extends AdminController
{
    /**
     * Liste des inscriptions SAFEB avec filtres et statistiques completes.
     */
    public function index(Request $request)
    {
        $query = $this->applyFilters(SafebRegistration::query(), $request);

        $registrations = $query
            ->orderByDesc('created_at')
            ->paginate(15)
            ->withQueryString();

        $groupedByType = SafebRegistration::query()
            ->select('type')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('type')
            ->pluck('count', 'type');

        return Inertia::render('Admin/SafebRegistrations/Index', [
            'registrations' => $registrations,
            'stats' => [
                'total' => $groupedByType->sum(),
                'panel' => (int) ($groupedByType['panel'] ?? 0),
                'partner' => (int) ($groupedByType['partner'] ?? 0),
                'stand' => (int) ($groupedByType['stand'] ?? 0),
                'masterclass' => (int) ($groupedByType['masterclass'] ?? 0),
                'pitch' => (int) ($groupedByType['pitch'] ?? 0),
                'culinary' => (int) ($groupedByType['culinary'] ?? 0),
                'film' => (int) ($groupedByType['film'] ?? 0),
                'new' => SafebRegistration::where('status', SafebRegistration::STATUS_NEW)->count(),
            ],
            'filters' => $request->only(['type', 'status', 'search']),
        ]);
    }

    /**
     * Met a jour le statut de suivi d'une inscription.
     */
    public function update(Request $request, SafebRegistration $registration)
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:' . implode(',', SafebRegistration::STATUSES)],
        ]);

        $wasConfirmed = $registration->status === SafebRegistration::STATUS_CONFIRMED;

        $registration->update($validated);

        if (!$wasConfirmed && $registration->status === SafebRegistration::STATUS_CONFIRMED) {
            $this->sendConfirmationEmail($registration);
        }

        return back()->with('success', 'Statut de l\'inscription mis a jour.');
    }

    /**
     * Supprime une inscription SAFEB.
     */
    public function destroy(SafebRegistration $registration)
    {
        $registration->delete();

        return back()->with('success', 'Inscription supprimee.');
    }

    /**
     * Change le statut de plusieurs inscriptions d'un coup (action groupee).
     */
    public function bulkStatusChange(Request $request)
    {
        $validated = $request->validate([
            'registration_ids' => ['required', 'array', 'min:1'],
            'registration_ids.*' => ['integer'],
            'status' => ['required', 'string', 'in:' . implode(',', SafebRegistration::STATUSES)],
        ]);

        $registrations = SafebRegistration::whereIn('id', $validated['registration_ids'])->get();

        foreach ($registrations as $registration) {
            $wasConfirmed = $registration->status === SafebRegistration::STATUS_CONFIRMED;

            $registration->update(['status' => $validated['status']]);

            if (!$wasConfirmed && $validated['status'] === SafebRegistration::STATUS_CONFIRMED) {
                $this->sendConfirmationEmail($registration);
            }
        }

        return back()->with('success', count($registrations) . ' inscription(s) mise(s) a jour.');
    }

    /**
     * Supprime plusieurs inscriptions d'un coup (action groupee).
     */
    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'registration_ids' => ['required', 'array', 'min:1'],
            'registration_ids.*' => ['integer'],
        ]);

        $deleted = SafebRegistration::whereIn('id', $validated['registration_ids'])->delete();

        return back()->with('success', $deleted . ' inscription(s) supprimee(s).');
    }

    /**
     * Exporte les inscriptions (filtres courants appliques) au format CSV.
     * Inclut les colonnes specialite et fichiers.
     */
    public function exportCsv(Request $request): StreamedResponse
    {
        $registrations = $this->applyFilters(SafebRegistration::query(), $request)
            ->orderByDesc('created_at')
            ->get();

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="safeb-inscriptions.csv"',
        ];

        $callback = function () use ($registrations) {
            $file = fopen('php://output', 'w');
            fwrite($file, "\xEF\xBB\xBF"); // BOM UTF-8

            fputcsv($file, [
                'ID',
                'Type',
                'Nom',
                'Email',
                'Telephone',
                'Organisation',
                'Option',
                'Specialite / Titre',
                'Message',
                'Fichiers',
                'Statut',
                'IP',
                'Date inscription',
            ]);

            foreach ($registrations as $registration) {
                fputcsv($file, [
                    $registration->id,
                    $registration->type_label,
                    $registration->name,
                    $registration->email,
                    $registration->phone,
                    $registration->organization,
                    $registration->option_label,
                    $registration->specialty,
                    $registration->message,
                    $registration->files ? count($registration->files) . ' fichier(s)' : '',
                    $registration->status_label,
                    $registration->ip_address,
                    $registration->created_at?->format('d/m/Y H:i'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Envoie un email de confirmation a l'inscrit lors du passage au statut "confirme".
     */
    private function sendConfirmationEmail(SafebRegistration $registration): void
    {
        try {
            Mail::to($registration->email)->send(new SafebRegistrationConfirmed([
                'type' => $registration->type,
                'type_label' => $registration->type_label,
                'name' => $registration->name,
                'email' => $registration->email,
                'option_label' => $registration->option_label,
            ]));
        } catch (\Throwable $exception) {
            report($exception);
        }
    }

    private function applyFilters($query, Request $request)
    {
        if ($type = $request->get('type')) {
            $query->where('type', $type);
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('organization', 'like', "%{$search}%")
                    ->orWhere('option_label', 'like', "%{$search}%")
                    ->orWhere('specialty', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        }

        return $query;
    }
}
