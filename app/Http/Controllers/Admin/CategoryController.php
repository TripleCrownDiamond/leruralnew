<?php

namespace App\Http\Controllers\Admin;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CategoryController extends AdminController
{
    public function index(Request $request)
    {
        $query = Category::query();
        $columns = $this->categoryColumns();

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search, $columns) {
                $q->where('name_fr', 'like', "%{$search}%");

                if (in_array('name_en', $columns, true)) {
                    $q->orWhere('name_en', 'like', "%{$search}%");
                }

                if (in_array('description_fr', $columns, true)) {
                    $q->orWhere('description_fr', 'like', "%{$search}%");
                }

                if (in_array('description_en', $columns, true)) {
                    $q->orWhere('description_en', 'like', "%{$search}%");
                }
            });
        }

        if ($request->filled('status') && $request->get('status') !== 'all') {
            $status = $request->get('status');
            $query->where('published', $status === 'active');
        }

        $categories = $query->orderBy('order')->paginate(10);

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories,
            'filters' => [
                'search' => $request->get('search'),
                'status' => $request->get('status', 'all'),
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Categories/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->rules());
        $payload = $this->normalizePayload($validated);
        $payload['slug'] = Str::slug($payload['name_fr']);

        Category::create($payload);

        return redirect()->route('dashboard.categories.index')->with('success', 'Categorie creee avec succes');
    }

    public function edit(Category $category)
    {
        return Inertia::render('Admin/Categories/Edit', [
            'category' => $category,
        ]);
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate($this->rules());
        $payload = $this->normalizePayload($validated);
        $payload['slug'] = Str::slug($payload['name_fr']);

        $category->update($payload);

        return redirect()->route('dashboard.categories.index')->with('success', 'Categorie mise a jour avec succes');
    }

    public function destroy(Category $category)
    {
        $category->delete();

        return redirect()->route('dashboard.categories.index')->with('success', 'Categorie supprimee avec succes');
    }

    private function rules(): array
    {
        $rules = [
            'name_fr' => 'required|string|max:255',
            'order' => 'integer|min:0',
            'published' => 'boolean',
            'image' => 'nullable|string',
        ];

        $columns = $this->categoryColumns();

        if (in_array('name_en', $columns, true)) {
            $rules['name_en'] = 'nullable|string|max:255';
        }

        if (in_array('description_fr', $columns, true)) {
            $rules['description_fr'] = 'nullable|string';
        }

        if (in_array('description_en', $columns, true)) {
            $rules['description_en'] = 'nullable|string';
        }

        if (in_array('image_position_x', $columns, true)) {
            $rules['image_position_x'] = 'nullable|integer|min:0|max:100';
        }

        if (in_array('image_position_y', $columns, true)) {
            $rules['image_position_y'] = 'nullable|integer|min:0|max:100';
        }

        return $rules;
    }

    private function normalizePayload(array $validated): array
    {
        $columns = $this->categoryColumns();

        if (in_array('name_en', $columns, true)) {
            $nameEn = trim((string) ($validated['name_en'] ?? ''));
            $validated['name_en'] = $nameEn !== '' ? $nameEn : (string) $validated['name_fr'];
        } else {
            unset($validated['name_en']);
        }

        return $validated;
    }

    private function categoryColumns(): array
    {
        static $columns = null;

        if ($columns === null) {
            $columns = Schema::getColumnListing('categories');
        }

        return $columns;
    }
}
