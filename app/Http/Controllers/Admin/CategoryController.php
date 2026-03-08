<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::orderBy('order')->paginate(10);
        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Categories/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name_fr' => 'required|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'description_fr' => 'nullable|string',
            'description_en' => 'nullable|string',
            'order' => 'integer|min:0',
            'published' => 'boolean',
            'image' => 'nullable|string',
        ]);

        $validated['slug'] = Str::slug($validated['name_fr']);

        // Image is now a URL string from Cloudinary/frontend upload, so we just save it directly
        // No need to handle file storage here if using CloudinaryUpload component which returns a URL

        Category::create($validated);

        return redirect()->route('dashboard.categories.index')->with('success', 'Catégorie créée avec succès');
    }

    public function edit(Category $category)
    {
        return Inertia::render('Admin/Categories/Edit', [
            'category' => $category
        ]);
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name_fr' => 'required|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'description_fr' => 'nullable|string',
            'description_en' => 'nullable|string',
            'order' => 'integer|min:0',
            'published' => 'boolean',
            'image' => 'nullable|string',
        ]);

        $validated['slug'] = Str::slug($validated['name_fr']);

        // Image is updated directly as string URL
        
        $category->update($validated);

        return redirect()->route('dashboard.categories.index')->with('success', 'Catégorie mise à jour avec succès');
    }

    public function destroy(Category $category)
    {
        // No local file deletion needed if using Cloudinary URLs or if we want to keep them
        // If we were deleting from Cloudinary, we'd need a service for that
        
        $category->delete();

        return redirect()->route('dashboard.categories.index')->with('success', 'Catégorie supprimée avec succès');
    }
}
