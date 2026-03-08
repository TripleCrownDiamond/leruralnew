<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\UserSubscription;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index()
    {
        $payments = Payment::with('user')->latest()->paginate(20);
        return Inertia::render('Admin/Payments/Index', [
            'payments' => $payments
        ]);
    }

    public function show(Payment $payment)
    {
        $payment->load('user');
        return Inertia::render('Admin/Payments/Show', [
            'payment' => $payment
        ]);
    }

    public function update(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,completed,failed,cancelled',
        ]);

        $previousStatus = $payment->status;
        $payment->update($validated);

        // If status changed to completed, activate service
        if ($previousStatus !== 'completed' && $validated['status'] === 'completed') {
            $this->activateService($payment);
        }

        return back()->with('success', 'Statut du paiement mis à jour.');
    }

    private function activateService(Payment $payment)
    {
        if ($payment->type === 'subscription') {
            $plan = SubscriptionPlan::find($payment->related_id);
            if ($plan) {
                // Create or Extend Subscription
                $currentSub = UserSubscription::where('user_id', $payment->user_id)
                    ->where('status', 'active')
                    ->latest()
                    ->first();

                $startsAt = now();
                if ($currentSub && $currentSub->ends_at > now()) {
                    $startsAt = $currentSub->ends_at; // Extend existing
                }

                UserSubscription::create([
                    'user_id' => $payment->user_id,
                    'subscription_plan_id' => $plan->id,
                    'starts_at' => $startsAt,
                    'ends_at' => $startsAt->copy()->addDays($plan->duration_days),
                    'status' => 'active',
                ]);
            }
        }
        // For 'article', access is checked directly against completed payments
    }
}