<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CategoryFollowController extends Controller
{
    public function store(Request $request, Category $category): RedirectResponse
    {
        $request->user()->followedCategories()->syncWithoutDetaching([$category->id]);

        return back()->with('success', 'Vous suivez maintenant cette rubrique.');
    }

    public function destroy(Request $request, Category $category): RedirectResponse
    {
        $request->user()->followedCategories()->detach($category->id);

        return back()->with('success', 'Suivi de rubrique desactive.');
    }
}
