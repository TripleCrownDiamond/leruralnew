<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Article;
use App\Models\SubscriptionPlan;
use App\Models\UserSubscription;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

use App\Models\Setting;
use App\Models\PaymentGateway;

class PaymentController extends Controller
{
    /**
     * Show the checkout page
     */
    public function checkout(Request $request)
    {
        $type = $request->query('type');
        $id = $request->query('id');

        if (!$type || !$id) {
            abort(404);
        }

        $item = null;
        $amount = 0;
        $name = '';

        if ($type === 'article') {
            $itemModel = Article::where('slug', $id)->orWhere('id', $id)->firstOrFail();
            $amount = $itemModel->price;
            $name = $itemModel->title_fr;
            $item = $itemModel->toArray(); // Serialize for Inertia
        } elseif ($type === 'subscription') {
            $itemModel = SubscriptionPlan::where('slug', $id)->firstOrFail();
            $amount = $itemModel->price;
            $name = $itemModel->name;
            $item = $itemModel->toArray();
        } else {
            abort(404);
        }

        // Get active gateways from DB
        $activeGateways = PaymentGateway::where('is_active', true)->get();
        $gateways = [];

        // Add Manual Gateway
        $gateways[] = [
            'id' => 'manual',
            'name' => 'Paiement Manuel',
            'logo' => null
        ];

        // Add CinetPay if configured
        if (config('services.cinetpay.site_id') && config('services.cinetpay.api_key')) {
             $gateways[] = [
                'id' => 'cinetpay',
                'name' => 'CinetPay (Mobile Money / Carte)',
                'logo' => null
            ];
        }

        // Add Kkiapay if configured
        if (config('services.kkiapay.public_key')) {
             $gateways[] = [
                'id' => 'kkiapay',
                'name' => 'Kkiapay (Mobile Money / Carte)',
                'logo' => null
            ];
        }

        // Add Stripe if configured
        if (config('services.stripe.key') && config('services.stripe.secret')) {
             $gateways[] = [
                'id' => 'stripe',
                'name' => 'Carte Bancaire (Stripe)',
                'logo' => null
            ];
        }

        return Inertia::render('Payment/Checkout', [
            'type' => $type,
            'item' => $item,
            'amount' => $amount,
            'itemName' => $name, // Renamed to avoid conflict
            'gateways' => $gateways
        ]);
    }

    /**
     * Process the payment
     */
    public function process(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:article,subscription',
            'item_id' => 'required', // slug or id
            'gateway' => 'required|in:manual,kkiapay,fedapay,qosic',
            'proof_file' => 'nullable|file|image|max:2048', // For manual payment
            'phone_number' => 'nullable|string', // For mobile money info
            'transaction_id' => 'nullable|string', // For automated gateways
        ]);

        $user = $request->user();
        $amount = 0;
        $relatedId = null;
        $description = '';

        // Resolve Item and Amount
        if ($validated['type'] === 'article') {
            $article = Article::where('slug', $validated['item_id'])->orWhere('id', $validated['item_id'])->firstOrFail();
            $amount = $article->price;
            $relatedId = $article->id;
            $description = "Achat article: " . $article->title_fr;
        } else {
            $plan = SubscriptionPlan::where('slug', $validated['item_id'])->orWhere('id', $validated['item_id'])->firstOrFail();
            $amount = $plan->price;
            $relatedId = $plan->id;
            $description = "Abonnement: " . $plan->name;
        }

        // Create Payment Record
        $payment = new Payment();
        $payment->user_id = $user->id;
        $payment->payment_method = $validated['gateway'];
        $payment->amount = $amount;
        $payment->currency = 'XOF';
        $payment->type = $validated['type'];
        $payment->related_id = $relatedId;
        $payment->status = 'pending'; // Default status

        // Handle Gateway Logic
        if ($validated['gateway'] === 'manual') {
            // Handle Manual Payment (Proof Upload)
            if ($request->hasFile('proof_file')) {
                $path = $request->file('proof_file')->store('payment_proofs', 'public');
                $payment->meta_data = [
                    'proof_path' => $path,
                    'phone_number' => $request->phone_number,
                    'notes' => 'Attente validation manuelle'
                ];
            }
            // For manual, status remains pending until admin approves
        } elseif ($validated['gateway'] === 'kkiapay') {
            // KkiaPay Verification
            $transactionId = $validated['transaction_id'];
            
            // TODO: In production, verify transaction with KkiaPay API
            // $client = new \GuzzleHttp\Client();
            // $response = $client->get("https://api.kkiapay.me/api/v1/transactions/verify/" . $transactionId, [
            //     'headers' => ['x-api-key' => env('KKIAPAY_PUBLIC_KEY'), 'x-private-key' => env('KKIAPAY_PRIVATE_KEY')]
            // ]);
            
            // For Sandbox/Demo, we trust the transaction ID if present
            if ($transactionId) {
                $payment->transaction_id = $transactionId;
                $payment->status = 'completed';
                $payment->meta_data = [
                    'gateway_response' => 'Verified via KkiaPay Widget'
                ];
                
                $this->activateService($payment);
            } else {
                $payment->status = 'failed';
            }
        } else {
            // Handle Automated Gateways (Dummy implementation for now)
            // In production, verify transaction with Gateway API using $validated['transaction_id']
            
            $payment->transaction_id = $validated['transaction_id'] ?? Str::uuid();
            $payment->status = 'completed'; // Auto-approve for demo/testing
            $payment->meta_data = [
                'gateway_response' => 'Simulated Success'
            ];

            // AUTO-ACTIVATE Service immediately
            $this->activateService($payment);
        }

        $payment->save();

        if ($payment->status === 'completed') {
            return redirect()->route('dashboard')->with('success', 'Paiement effectué avec succès ! Votre accès est activé.');
        } else {
            return redirect()->route('dashboard')->with('success', 'Paiement enregistré. Votre accès sera activé après validation.');
        }
    }

    /**
     * Activate the service (Subscription or Article Access)
     */
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
        } elseif ($payment->type === 'article') {
            // For one-time article purchase, we check Payment table directly in ArticleController
            // Or we could have a PurchasedArticle model. 
            // For now, ArticleController will query Payment model.
        }
    }

    public function history(Request $request)
    {
        $payments = Payment::where('user_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'amount' => $p->amount,
                'currency' => $p->currency,
                'status' => $p->status,
                'date' => $p->created_at->format('d/m/Y'),
                'description' => $p->description ?? ($p->type === 'article' ? 'Achat Article' : 'Abonnement'),
                'method' => $p->payment_method,
            ]);

        return Inertia::render('Dashboard/Purchases', [
            'payments' => $payments
        ]);
    }
}