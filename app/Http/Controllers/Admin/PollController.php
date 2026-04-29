<?php

namespace App\Http\Controllers\Admin;

use App\Models\Poll;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PollController extends AdminController
{
    public function index(Request $request)
    {
        $query = Poll::with([
            'options' => fn ($q) => $q->orderBy('id'),
        ])->withCount('options');

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where('question', 'like', "%{$search}%");
        }

        if ($request->filled('status') && $request->get('status') !== 'all') {
            $query->where('is_active', $request->get('status') === 'active');
        }

        return Inertia::render('Dashboard/Polls/Index', [
            'polls' => $query->latest()->paginate(10),
            'filters' => [
                'search' => $request->get('search'),
                'status' => $request->get('status', 'all'),
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Dashboard/Polls/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'question' => 'required|string|max:255',
            'image' => 'nullable|url|max:2048',
            'is_active' => 'boolean',
            'expires_at' => 'nullable|date',
            'options' => 'required|array|min:2',
            'options.*.label' => 'required|string|max:255',
        ]);

        $poll = Poll::create([
            'question' => $validated['question'],
            'image' => $validated['image'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'expires_at' => $validated['expires_at'] ?? null,
        ]);

        foreach ($validated['options'] as $option) {
            $poll->options()->create([
                'label' => $option['label'],
            ]);
        }

        return redirect()->route('dashboard.polls.index')
            ->with('success', 'Sondage cree avec succes.');
    }

    public function show(string $id)
    {
        abort(404);
    }

    public function edit(Poll $poll)
    {
        $poll->load('options');

        return Inertia::render('Dashboard/Polls/Edit', [
            'poll' => $poll,
        ]);
    }

    public function update(Request $request, Poll $poll)
    {
        $validated = $request->validate([
            'question' => 'required|string|max:255',
            'image' => 'nullable|url|max:2048',
            'is_active' => 'boolean',
            'expires_at' => 'nullable|date',
            'options' => 'required|array|min:2',
            'options.*.id' => 'nullable|exists:poll_options,id',
            'options.*.label' => 'required|string|max:255',
        ]);

        $poll->update([
            'question' => $validated['question'],
            'image' => $validated['image'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'expires_at' => $validated['expires_at'] ?? null,
        ]);

        $submittedOptionIds = collect($validated['options'])
            ->pluck('id')
            ->filter()
            ->toArray();

        $poll->options()->whereNotIn('id', $submittedOptionIds)->delete();

        foreach ($validated['options'] as $optionData) {
            if (!empty($optionData['id'])) {
                $poll->options()->where('id', $optionData['id'])->update([
                    'label' => $optionData['label'],
                ]);
            } else {
                $poll->options()->create([
                    'label' => $optionData['label'],
                ]);
            }
        }

        return redirect()->route('dashboard.polls.index')
            ->with('success', 'Sondage mis a jour avec succes.');
    }

    public function destroy(Poll $poll)
    {
        $poll->delete();

        return redirect()->route('dashboard.polls.index')
            ->with('success', 'Sondage supprime avec succes.');
    }

    public function bulkDelete(Request $request)
    {
        $pollIds = $request->input('poll_ids', []);

        if (!is_array($pollIds) || empty($pollIds)) {
            return back()->with('error', 'Aucun sondage selectionne.');
        }

        Poll::whereIn('id', $pollIds)->delete();

        return back()->with('success', count($pollIds) . ' sondage(s) supprime(s) avec succes.');
    }

    public function exportSelected(Request $request, string $format)
    {
        $pollIds = $request->get('polls');

        if (is_string($pollIds)) {
            $pollIds = json_decode($pollIds, true) ?? [];
        }

        if (!is_array($pollIds) || empty($pollIds)) {
            return back()->with('error', 'Veuillez selectionner au moins un sondage.');
        }

        $polls = Poll::with('options')->whereIn('id', $pollIds)->get();

        if ($format === 'pdf') {
            return $this->exportToPdf($polls, 'sondages-selectionnes');
        }

        return $this->exportToCsv($polls, 'sondages-selectionnes');
    }

    public function exportAll(string $format)
    {
        $polls = Poll::with('options')->get();

        if ($format === 'pdf') {
            return $this->exportToPdf($polls, 'tous-les-sondages');
        }

        return $this->exportToCsv($polls, 'tous-les-sondages');
    }

    private function exportToCsv($polls, string $filename): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '.csv"',
        ];

        $callback = function () use ($polls) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Question', 'Statut', 'Total votes', 'Options']);

            foreach ($polls as $poll) {
                $optionLabels = $poll->options->pluck('label')->implode(' | ');
                $totalVotes = $poll->options->sum('votes');

                fputcsv($file, [
                    $poll->id,
                    $poll->question,
                    $poll->is_active ? 'Actif' : 'Inactif',
                    $totalVotes,
                    $optionLabels,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportToPdf($polls, string $filename)
    {
        $pollData = $polls->map(function ($poll) {
            $totalVotes = $poll->options->sum('votes');

            return [
                'question' => $poll->question,
                'is_active' => $poll->is_active,
                'created_at' => $poll->created_at->format('d/m/Y'),
                'total_votes' => $totalVotes,
                'options' => $poll->options->map(function ($option) use ($totalVotes) {
                    $votes = $option->votes ?? 0;

                    return [
                        'label' => $option->label,
                        'votes' => $votes,
                        'percentage' => $totalVotes > 0 ? round(($votes / $totalVotes) * 100, 1) : 0,
                    ];
                })->toArray(),
            ];
        })->toArray();

        $pdf = Pdf::loadView('exports.polls-pdf', [
            'polls' => $pollData,
            'filename' => $filename,
            'generated_at' => now()->format('d/m/Y H:i'),
        ]);

        return $pdf->download($filename . '.pdf');
    }

    public function results(Poll $poll)
    {
        $poll->load('options');
        $totalVotes = $poll->options->sum('votes');

        $options = $poll->options->map(function ($option) use ($totalVotes) {
            return [
                'id' => $option->id,
                'label' => $option->label,
                'votes' => $option->votes,
                'percentage' => $totalVotes > 0 ? round(($option->votes / $totalVotes) * 100, 1) : 0,
            ];
        });

        return Inertia::render('Dashboard/Polls/Results', [
            'poll' => [
                'id' => $poll->id,
                'question' => $poll->question,
                'image' => $poll->image,
                'is_active' => $poll->is_active,
                'expires_at' => $poll->expires_at,
                'created_at' => $poll->created_at,
                'options' => $options,
                'total_votes' => $totalVotes,
            ],
        ]);
    }

    public function export(Request $request, Poll $poll)
    {
        $format = $request->get('format', 'csv');
        $poll->load('options');

        if ($format === 'pdf') {
            return $this->exportToPdf(collect([$poll]), 'poll_' . $poll->id . '_results');
        }

        return $this->exportToCsv(collect([$poll]), 'poll_' . $poll->id . '_results');
    }
}