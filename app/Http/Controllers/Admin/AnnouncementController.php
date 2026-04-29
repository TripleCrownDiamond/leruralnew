<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends AdminController
{
    public function index(): Response
    {
        return Inertia::render('Dashboard/Announcements/Index', [
            'announcements' => Announcement::orderBy('sort_order')->orderByDesc('created_at')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'label' => ['nullable', 'string', 'max:100'],
            'message' => ['required', 'string', 'max:255'],
            'link_url' => ['nullable', 'url', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        Announcement::create([
            'label' => filled($data['label'] ?? null) ? trim($data['label']) : null,
            'message' => trim($data['message']),
            'link_url' => filled($data['link_url'] ?? null) ? trim($data['link_url']) : null,
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => !empty($data['is_active']),
        ]);

        return back()->with('success', 'Annonce ajoutee.');
    }

    public function update(Request $request, Announcement $announcement)
    {
        $data = $request->validate([
            'label' => ['nullable', 'string', 'max:100'],
            'message' => ['required', 'string', 'max:255'],
            'link_url' => ['nullable', 'url', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $announcement->update([
            'label' => filled($data['label'] ?? null) ? trim($data['label']) : null,
            'message' => trim($data['message']),
            'link_url' => filled($data['link_url'] ?? null) ? trim($data['link_url']) : null,
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => !empty($data['is_active']),
        ]);

        return back()->with('success', 'Annonce mise a jour.');
    }

    public function destroy(Announcement $announcement)
    {
        $announcement->delete();

        return back()->with('success', 'Annonce supprimee.');
    }
}
