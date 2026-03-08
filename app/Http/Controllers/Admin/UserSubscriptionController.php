<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\UserSubscription;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserSubscriptionController extends Controller
{
    public function index()
    {
        $subscriptions = UserSubscription::with(['user', 'plan'])->latest()->paginate(20);
        return Inertia::render('Admin/Subscriptions/Index', [
            'subscriptions' => $subscriptions
        ]);
    }
}