<?php

namespace App\Http\Controllers;

use App\Models\Emission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class EmissionController extends Controller
{
    public function index()
    {
        $emissions = Emission::orderBy('order')->get();
        return Inertia::render('Dashboard/Emissions/Index', [
            'emissions' => $emissions
        ]);
    }

    public function create()
    {
        return Inertia::render('Dashboard/Emissions/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'playlist_url' => 'required|url',
            'is_active' => 'boolean',
            'order' => 'integer',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('emissions', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        Emission::create($validated);

        return redirect()->route('dashboard.emissions.index')
            ->with('success', 'Émission créée avec succès.');
    }

    public function edit(Emission $emission)
    {
        return Inertia::render('Dashboard/Emissions/Edit', [
            'emission' => $emission
        ]);
    }

    public function update(Request $request, Emission $emission)
    {
        // For update, image is optional. If not provided, keep old one.
        // Also need to handle "remove image" if needed, but for now simple replacement.
        
        $rules = [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'playlist_url' => 'required|url',
            'is_active' => 'boolean',
            'order' => 'integer',
        ];

        if ($request->hasFile('image')) {
            $rules['image'] = 'image|max:2048';
        }

        $validated = $request->validate($rules);

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($emission->image) {
                $oldPath = str_replace('/storage/', '', $emission->image);
                Storage::disk('public')->delete($oldPath);
            }
            
            $path = $request->file('image')->store('emissions', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $emission->update($validated);

        return redirect()->route('dashboard.emissions.index')
            ->with('success', 'Émission mise à jour avec succès.');
    }

    public function destroy(Emission $emission)
    {
        if ($emission->image) {
            $oldPath = str_replace('/storage/', '', $emission->image);
            Storage::disk('public')->delete($oldPath);
        }
        
        $emission->delete();
        return redirect()->back()->with('success', 'Émission supprimée.');
    }
}
