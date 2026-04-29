<?php

namespace App\Http\Controllers\Admin;

use App\Models\Agenda;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AgendaController extends AdminController
{
    public function index(Request $request)
    {
        $query = Agenda::query();

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('time', 'like', "%{$search}%");
            });
        }

        if ($status = $request->get('status')) {
            $query->where('is_active', $status === 'active');
        }

        $agendas = $query
            ->orderByDesc('is_active')
            ->orderBy('date')
            ->orderBy('time')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Agendas/Index', [
            'agendas' => $agendas,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'date' => 'required|date',
            'time' => 'nullable|string|max:20',
            'location' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        Agenda::create($validated);

        return back()->with('success', 'Element agenda ajoute.');
    }

    public function update(Request $request, Agenda $agenda)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'date' => 'required|date',
            'time' => 'nullable|string|max:20',
            'location' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $agenda->update($validated);

        return back()->with('success', 'Element agenda mis a jour.');
    }

    public function destroy(Agenda $agenda)
    {
        $agenda->delete();

        return back()->with('success', 'Element agenda supprime.');
    }
}