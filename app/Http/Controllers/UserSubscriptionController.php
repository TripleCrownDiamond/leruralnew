<?php

namespace App\Http\Controllers;

use App\Models\SubscriptionPlan;
use App\Models\UserSubscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UserSubscriptionController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $currentSubscription = UserSubscription::query()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->where('ends_at', '>', now())
            ->with('plan')
            ->latest()
            ->first();

        $subscriptionHistory = UserSubscription::query()
            ->where('user_id', $user->id)
            ->with('plan')
            ->orderByDesc('created_at')
            ->get();

        $availablePlans = SubscriptionPlan::query()
            ->where('is_active', true)
            ->orderBy('price')
            ->get();

        return Inertia::render('Profile/Subscription', [
            'currentSubscription' => $currentSubscription,
            'subscriptionHistory' => $subscriptionHistory,
            'availablePlans' => $availablePlans,
        ]);
    }

    public function cancel(Request $request)
    {
        return back()->with('info', 'Fonctionnalite a venir.');
    }
}
