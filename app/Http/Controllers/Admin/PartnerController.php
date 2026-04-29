<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Partner;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PartnerController extends AdminController
{
    public function index(): Response
    {
        return Inertia::render('Dashboard/Partners/Index', [
            'partners' => Partner::orderBy('order')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'logo' => ['required', 'url', 'max:2048'],
            'url' => ['nullable', 'url', 'max:2048'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        Partner::create([
            'name' => trim($data['name']),
            'logo' => trim($data['logo']),
            'url' => filled($data['url'] ?? null) ? trim($data['url']) : null,
            'order' => $data['order'] ?? 0,
            'is_active' => !empty($data['is_active']),
        ]);

        return back()->with('success', 'Partenaire ajoute.');
    }

    public function update(Request $request, Partner $partner)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'logo' => ['required', 'url', 'max:2048'],
            'url' => ['nullable', 'url', 'max:2048'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $partner->update([
            'name' => trim($data['name']),
            'logo' => trim($data['logo']),
            'url' => filled($data['url'] ?? null) ? trim($data['url']) : null,
            'order' => $data['order'] ?? 0,
            'is_active' => !empty($data['is_active']),
        ]);

        return back()->with('success', 'Partenaire mis a jour.');
    }

    public function destroy(Partner $partner)
    {
        $partner->delete();

        return back()->with('success', 'Partenaire supprime.');
    }
}
