<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Poll;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PollController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $polls = Poll::with(['options' => function($query) {
                $query->orderBy('id');
            }])
            ->withCount('options')
            ->latest()
            ->distinct()
            ->paginate(10);

        return Inertia::render('Dashboard/Polls/Index', [
            'polls' => $polls,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Dashboard/Polls/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'question' => 'required|string|max:255',
            'is_active' => 'boolean',
            'expires_at' => 'nullable|date',
            'options' => 'required|array|min:2',
            'options.*.label' => 'required|string|max:255',
        ]);

        $poll = Poll::create([
            'question' => $validated['question'],
            'is_active' => $validated['is_active'] ?? true,
            'expires_at' => $validated['expires_at'],
        ]);

        foreach ($validated['options'] as $option) {
            $poll->options()->create([
                'label' => $option['label'],
            ]);
        }

        return redirect()->route('dashboard.polls.index')
            ->with('success', 'Sondage créé avec succès.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Poll $poll)
    {
        $poll->load('options');

        return Inertia::render('Dashboard/Polls/Edit', [
            'poll' => $poll,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Poll $poll)
    {
        $validated = $request->validate([
            'question' => 'required|string|max:255',
            'is_active' => 'boolean',
            'expires_at' => 'nullable|date',
            'options' => 'required|array|min:2',
            'options.*.id' => 'nullable|exists:poll_options,id',
            'options.*.label' => 'required|string|max:255',
        ]);

        $poll->update([
            'question' => $validated['question'],
            'is_active' => $validated['is_active'] ?? true,
            'expires_at' => $validated['expires_at'],
        ]);

        // Sync options
        // 1. Get current option IDs from request
        $submittedOptionIds = collect($validated['options'])
            ->pluck('id')
            ->filter()
            ->toArray();

        // 2. Delete options not in request
        $poll->options()->whereNotIn('id', $submittedOptionIds)->delete();

        // 3. Update or Create options
        foreach ($validated['options'] as $optionData) {
            if (isset($optionData['id'])) {
                $poll->options()->where('id', $optionData['id'])->update(['label' => $optionData['label']]);
            } else {
                $poll->options()->create(['label' => $optionData['label']]);
            }
        }

        return redirect()->route('dashboard.polls.index')
            ->with('success', 'Sondage mis à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Poll $poll)
    {
        $poll->delete();
        return redirect()->route('dashboard.polls.index')
            ->with('success', 'Sondage supprimé avec succès.');
    }
}
