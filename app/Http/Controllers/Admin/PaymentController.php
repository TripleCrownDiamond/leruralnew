<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\UserSubscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Mail\PaymentStatusUpdated;
use App\Mail\PurchaseInvoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PaymentController extends AdminController
{
    public function index(Request $request)
    {
        $query = Payment::with('user')->latest();

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($uq) use ($search) {
                    $uq->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhere('transaction_id', 'like', "%{$search}%")
                ->orWhere('payment_method', 'like', "%{$search}%")
                ->orWhere('reference', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->string('status')->toString() !== 'all') {
            $query->where('status', $request->string('status')->toString());
        }

        if ($request->filled('type') && $request->string('type')->toString() !== 'all') {
            $query->where('type', $request->string('type')->toString());
        }

        $payments = $query->paginate(20)->withQueryString();

        return Inertia::render('Admin/Payments/Index', [
            'payments' => $payments,
            'filters' => [
                'search' => $request->get('search'),
                'status' => $request->get('status', 'all'),
                'type' => $request->get('type', 'all'),
            ],
        ]);
    }

    public function create()
    {
        $users = User::orderBy('name')->get(['id', 'name', 'email']);
        return Inertia::render('Admin/Payments/Create', [
            'users' => $users
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:0',
            'currency' => 'required|string|in:XOF,EUR,USD',
            'status' => 'required|in:pending,completed,failed,cancelled',
            'payment_method' => 'required|string',
            'type' => 'required|in:subscription,one_time,refund',
            'transaction_id' => 'nullable|string',
            'description' => 'nullable|string',
            'paid_at' => 'nullable|date',
            'receipt_image' => 'nullable|string',
            'phone_number' => 'nullable|string',
            'provider' => 'nullable|string',
            'reference' => 'nullable|string',
        ]);

        $payment = Payment::create($validated);

        // If payment is completed, activate the service
        if ($validated['status'] === 'completed') {
            $this->activateService($payment);
        }

        $this->notifyUserStatusChange($payment, $validated['status']);

        return redirect()->route('dashboard.payments.index')
            ->with('success', 'Paiement cree avec succes.');
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

        if ($payment->status === 'completed') {
            if ($validated['status'] !== 'completed') {
                return back()->with('error', 'Ce paiement est deja valide. Action verrouillee.');
            }

            $activated = $this->activateService($payment);

            return back()->with(
                'success',
                $activated
                    ? 'Paiement deja valide, souscription synchronisee.'
                    : 'Paiement deja valide. Souscription deja active.',
            );
        }

        $previousStatus = $payment->status;
        $payment->update($validated);

        Log::info('admin.payment.status_updated', [
            'payment_id' => $payment->id,
            'from' => $previousStatus,
            'to' => $validated['status'],
            'admin_id' => $request->user()?->id,
        ]);

        if ($validated['status'] === 'completed') {
            $this->activateService($payment);
        }

        if ($previousStatus !== $validated['status']) {
            $this->notifyUserStatusChange($payment, $validated['status']);
        }

        return back()->with('success', 'Statut du paiement mis a jour.');
    }

    private function notifyUserStatusChange(Payment $payment, string $status): void
    {
        try {
            $payment->loadMissing('user');

            if (!$payment->user?->email) {
                return;
            }

            $statusLabel = match ($status) {
                'completed' => 'Valide',
                'failed' => 'Rejete',
                'cancelled' => 'Annule',
                default => 'En attente',
            };

            $message = match ($status) {
                'completed' => 'Votre paiement a ete confirme. Vos acces ont ete actives.',
                'failed' => 'Votre paiement a ete rejete apres verification admin.',
                'cancelled' => 'Votre paiement a ete annule. Vous pouvez relancer un nouvel achat.',
                default => 'Votre paiement est en attente de verification admin.',
            };

            Mail::to($payment->user->email)->send(new PaymentStatusUpdated($payment, $statusLabel, $message));

            if ($status === 'completed') {
                Mail::to($payment->user->email)->send(new PurchaseInvoice($payment));
            }
        } catch (\Throwable $exception) {
            report($exception);
        }
    }

    private function activateService(Payment $payment): bool
    {
        if ($payment->type !== 'subscription') {
            return false;
        }

        $plan = SubscriptionPlan::find($payment->related_id);
        if (!$plan) {
            Log::warning('admin.payment.activate_service_plan_missing', [
                'payment_id' => $payment->id,
                'related_id' => $payment->related_id,
            ]);

            return false;
        }

        $activeSamePlan = UserSubscription::where('user_id', $payment->user_id)
            ->where('subscription_plan_id', $plan->id)
            ->where('status', 'active')
            ->where('ends_at', '>', now())
            ->exists();

        if ($activeSamePlan) {
            return false;
        }

        $currentSub = UserSubscription::where('user_id', $payment->user_id)
            ->where('status', 'active')
            ->latest()
            ->first();

        $startsAt = now();
        if ($currentSub && $currentSub->ends_at > now()) {
            $startsAt = $currentSub->ends_at;
        }

        UserSubscription::create([
            'user_id' => $payment->user_id,
            'subscription_plan_id' => $plan->id,
            'starts_at' => $startsAt,
            'ends_at' => (clone $startsAt)->addDays($plan->duration_days),
            'status' => 'active',
        ]);

        Log::info('admin.payment.subscription_activated', [
            'payment_id' => $payment->id,
            'user_id' => $payment->user_id,
            'plan_id' => $plan->id,
            'starts_at' => $startsAt,
        ]);

        return true;
    }
}
