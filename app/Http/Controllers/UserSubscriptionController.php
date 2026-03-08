<?php

namespace App\Http\Controllers;

use App\Models\SubscriptionPlan;
use App\Models\UserSubscription;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class UserSubscriptionController extends Controller
{
    /**
     * Display the user's subscription details and history.
     */
    public function index()
    {
        $user = Auth::user();
        
        $currentSubscription = UserSubscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->where('end_date', '>', now())
            ->with('plan')
            ->latest()
            ->first();

        $subscriptionHistory = UserSubscription::where('user_id', $user->id)
            ->with('plan')
            ->orderByDesc('created_at')
            ->get();

        $availablePlans = SubscriptionPlan::where('is_active', true)->orderBy('price')->get();

        return Inertia::render('Profile/Subscription', [
            'currentSubscription' => $currentSubscription,
            'subscriptionHistory' => $subscriptionHistory,
            'availablePlans' => $availablePlans,
        ]);
    }

    /**
     * Cancel the current subscription (if applicable).
     */
    public function cancel(Request $request)
    {
        // Logic to cancel auto-renew if implemented
        return back()->with('info', 'Fonctionnalité à venir.');
    }
}