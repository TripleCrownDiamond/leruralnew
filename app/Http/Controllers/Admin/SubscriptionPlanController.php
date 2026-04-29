<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SubscriptionPlanController extends AdminController
{
    public function index(Request $request)
    {
        $query = SubscriptionPlan::query();

        // Search filter
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->filled('status') && $request->get('status') !== 'all') {
            $status = $request->get('status');
            $query->where('is_active', $status === 'active');
        }

        // Featured filter
        if ($request->filled('featured') && $request->get('featured') !== 'all') {
            $featured = $request->get('featured');
            $query->where('is_featured', $featured === 'featured');
        }

        // Pagination
        $plans = $query->latest()->paginate(10);

        // Pass filters to view
        $filters = [
            'search' => $request->get('search'),
            'status' => $request->get('status', 'all'),
            'featured' => $request->get('featured', 'all'),
        ];

        return Inertia::render('Admin/SubscriptionPlans/Index', [
            'plans' => $plans,
            'filters' => $filters
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/SubscriptionPlans/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|integer|min:0',
            'duration_days' => 'required|integer|min:1',
            'features' => 'nullable|array',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        
        SubscriptionPlan::create($validated);

        return redirect()->route('dashboard.subscription-plans.index')
            ->with('success', 'Plan créé avec succès');
    }

    public function edit(SubscriptionPlan $subscriptionPlan)
    {
        return Inertia::render('Admin/SubscriptionPlans/Edit', [
            'plan' => $subscriptionPlan
        ]);
    }

    public function update(Request $request, SubscriptionPlan $subscriptionPlan)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|integer|min:0',
            'duration_days' => 'required|integer|min:1',
            'features' => 'nullable|array',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ]);

        if ($subscriptionPlan->name !== $validated['name']) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $subscriptionPlan->update($validated);

        return redirect()->route('dashboard.subscription-plans.index')
            ->with('success', 'Plan mis à jour avec succès');
    }

    public function destroy(SubscriptionPlan $subscriptionPlan)
    {
        $subscriptionPlan->delete();
        return redirect()->route('dashboard.subscription-plans.index')
            ->with('success', 'Plan supprimé avec succès');
    }
}