<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CommodityPrice;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CommodityPriceController extends AdminController
{
    public function index(Request $request)
    {
        $query = CommodityPrice::query();

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('country', 'like', "%{$search}%")
                    ->orWhere('note', 'like', "%{$search}%");
            });
        }

        if ($status = $request->get('status')) {
            $query->where('active', $status === 'active');
        }

        $prices = $query->orderByDesc('active')->orderBy('name')->paginate(20)->withQueryString();

        return Inertia::render('Admin/CommodityPrices/Index', [
            'prices' => $prices,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|string|max:100',
            'unit' => 'required|string|max:100',
            'country' => 'nullable|string|max:100',
            'note' => 'nullable|string|max:255',
            'active' => 'boolean',
        ]);

        CommodityPrice::create($validated);

        return back()->with('success', 'Prix ajoute.');
    }

    public function update(Request $request, CommodityPrice $commodityPrice)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|string|max:100',
            'unit' => 'required|string|max:100',
            'country' => 'nullable|string|max:100',
            'note' => 'nullable|string|max:255',
            'active' => 'boolean',
        ]);

        $commodityPrice->update($validated);

        return back()->with('success', 'Prix mis a jour.');
    }

    public function destroy(CommodityPrice $commodityPrice)
    {
        $commodityPrice->delete();

        return back()->with('success', 'Prix supprime.');
    }
}

