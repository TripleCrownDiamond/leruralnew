<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Payment;
use App\Models\PaymentGateway;
use App\Models\PromoCode;
use App\Models\PressPaper;
use App\Models\SubscriptionPlan;
use App\Models\UserSubscription;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use App\Models\User;
use App\Mail\PaymentSubmittedAdmin;
use App\Mail\PurchaseCreatedAlert;
use App\Mail\PurchaseInvoice;
use App\Mail\PaymentStatusUpdated;
use App\Services\MediaUploadService;
use App\Services\NotificationRecipientService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function checkout(Request $request)
    {
        if ($request->user()?->isAdmin()) {
            Log::warning('checkout.blocked_admin', ['user_id' => $request->user()?->id]);
            return redirect()->route('dashboard')->with('error', "Les administrateurs n'ont pas acces au checkout.");
        }

        $this->ensureDefaultGateways();
        PromoCode::ensureDefaultCode();

        $type = $request->query('type');
        Log::info('checkout.entry', [
            'user_id' => $request->user()?->id,
            'type' => $type,
            'id' => $request->query('id') ?? $request->query('item'),
            'promo_code' => $request->query('promo_code'),
        ]);
        $id = $request->query('id') ?? $request->query('item');

        if (!$type) {
            abort(404);
        }

        [$item, $amount, $name] = $this->resolveCheckoutItem($type, $id);

        $dbGateways = PaymentGateway::where('is_active', true)->get();
        $gateways = [];
        $manualExistsInDB = false;

        foreach ($dbGateways as $gateway) {
            $config = $gateway->config ?? [];
            $gatewayConfig = [];
            $instructions = $gateway->instructions ?? null;

            if (is_array($config)) {
                foreach ($config as $itemConfig) {
                    if (!isset($itemConfig['key'])) {
                        continue;
                    }

                    $gatewayConfig[$itemConfig['key']] = $itemConfig['value'] ?? null;

                    if ($itemConfig['key'] === 'instructions' && !$instructions) {
                        $instructions = $itemConfig['value'] ?? null;
                    }
                }
            }

            $isManual = in_array($gateway->slug, ['manual', 'manual-payment', 'mtn_momo', 'flooz', 'especes', 'cash'], true)
                || str_contains($gateway->slug, 'manual')
                || str_contains($gateway->slug, 'momo')
                || str_contains($gateway->slug, 'flooz');

            $gateways[] = [
                'id' => $gateway->slug,
                'name' => $gateway->name,
                'logo' => $gateway->logo,
                'type' => $isManual ? 'manual' : 'automatic',
                'description' => $gateway->description ?? null,
                'instructions' => $instructions,
                'config' => $gatewayConfig,
            ];

            if ($isManual) {
                $manualExistsInDB = true;
            }
        }

        if (!$manualExistsInDB) {
            $gateways[] = [
                'id' => 'manual',
                'name' => 'Paiement Manuel',
                'logo' => null,
                'type' => 'manual',
                'description' => null,
                'instructions' => null,
                'config' => [],
            ];
        }

        if (config('services.cinetpay.site_id') && config('services.cinetpay.api_key')) {
            $gateways[] = [
                'id' => 'cinetpay',
                'name' => 'CinetPay (Mobile Money / Carte)',
                'logo' => null,
                'type' => 'automatic',
                'description' => 'Paiement via CinetPay',
                'instructions' => null,
                'config' => [
                    'site_id' => config('services.cinetpay.site_id'),
                    'api_key' => config('services.cinetpay.api_key'),
                ],
            ];
        }

        if (config('services.stripe.key') && config('services.stripe.secret')) {
            $gateways[] = [
                'id' => 'stripe',
                'name' => 'Carte Bancaire (Stripe)',
                'logo' => null,
                'type' => 'automatic',
                'description' => 'Paiement par carte bancaire via Stripe',
                'instructions' => null,
                'config' => [
                    'public_key' => config('services.stripe.key'),
                    'secret_key' => config('services.stripe.secret'),
                ],
            ];
        }

        $requestedPromoCode = PromoCode::normalizeCode($request->query('promo_code'));
        $promoError = null;
        $appliedPromo = null;
        $discountAmount = 0.0;
        $finalAmount = (float) $amount;

        if ($requestedPromoCode) {
            $promoCode = PromoCode::findActiveByCode($requestedPromoCode);

            if (!$promoCode) {
                $promoError = 'Ce code promo est invalide ou inactif.';
            } elseif (!$promoCode->canBeUsedForAmount((float) $amount)) {
                $promoError = 'Ce code promo ne peut pas etre applique a ce panier.';
            } elseif (!$promoCode->supportsCheckout($type, isset($item['id']) ? (int) $item['id'] : null)) {
                $promoError = "Ce code promo n'est pas valable pour cette offre.";
            } else {
                $discountAmount = $promoCode->computeDiscount((float) $amount);
                $finalAmount = max(0.0, round((float) $amount - $discountAmount, 2));
                $appliedPromo = [
                    'code' => $promoCode->code,
                    'name' => $promoCode->name,
                    'description' => $promoCode->description,
                    'discount_type' => $promoCode->discount_type,
                    'discount_value' => (float) $promoCode->discount_value,
                ];
            }
        }

        Log::info('checkout.render', [
            'user_id' => $request->user()?->id,
            'type' => $type,
            'item_id' => $item['id'] ?? null,
            'item_slug' => $item['slug'] ?? null,
            'amount' => (float) $amount,
            'final_amount' => (float) $finalAmount,
            'gateway_count' => count($gateways),
            'promo_applied' => $appliedPromo['code'] ?? null,
            'promo_error' => $promoError,
        ]);

        return Inertia::render('Payment/Checkout', [
            'type' => $type,
            'item' => $item,
            'amount' => $finalAmount,
            'original_amount' => (float) $amount,
            'discount_amount' => $discountAmount,
            'name' => $name,
            'gateways' => $gateways,
            'requested_promo_code' => $requestedPromoCode,
            'applied_promo' => $appliedPromo,
            'promo_error' => $promoError,
        ]);
    }

    public function process(Request $request, MediaUploadService $mediaUploadService)
    {
        if ($request->user()?->isAdmin()) {
            Log::warning('payment.process.blocked_admin', ['user_id' => $request->user()?->id]);
            return redirect()->route('dashboard')->with('error', 'Les administrateurs ne peuvent pas soumettre de paiement.');
        }

        Log::info('payment.process.entry', [
            'user_id' => $request->user()?->id,
            'type' => $request->input('type'),
            'item_id' => $request->input('item_id'),
            'gateway' => $request->input('gateway'),
            'has_proof_file' => $request->hasFile('proof_file'),
            'promo_code' => $request->input('promo_code'),
        ]);

        $validated = $request->validate([
            'type' => 'required|in:article,subscription,paper',
            'item_id' => 'required',
            'gateway' => 'required|string',
            'proof_file' => 'nullable|file|image|max:2048',
            'phone_number' => 'nullable|string',
            'transaction_id' => 'nullable|string',
            'promo_code' => 'nullable|string|max:64',
        ]);

        Log::info('payment.process.validated', [
            'user_id' => $request->user()?->id,
            'type' => $validated['type'],
            'item_id' => $validated['item_id'],
            'gateway' => $validated['gateway'],
            'promo_code' => $validated['promo_code'] ?? null,
        ]);

        [$amount, $relatedId, $description] = $this->resolvePaymentItem(
            $validated['type'],
            $validated['item_id'],
        );

        $promoCode = null;
        $promoMeta = null;
        $finalAmount = (float) $amount;

        if (!empty($validated['promo_code'])) {
            $promoCode = PromoCode::findActiveByCode($validated['promo_code']);

            if ($promoCode && $promoCode->canBeUsedForAmount((float) $amount) && $promoCode->supportsCheckout($validated['type'], (int) $relatedId)) {
                $discountAmount = $promoCode->computeDiscount((float) $amount);
                $finalAmount = max(0.0, round((float) $amount - $discountAmount, 2));
                $promoMeta = [
                    'code' => $promoCode->code,
                    'discount_type' => $promoCode->discount_type,
                    'discount_value' => (float) $promoCode->discount_value,
                    'discount_amount' => $discountAmount,
                    'original_amount' => (float) $amount,
                    'final_amount' => $finalAmount,
                ];
            }
        }

        $payment = new Payment();
        $payment->user_id = $request->user()->id;
        $payment->payment_method = $validated['gateway'];
        $payment->amount = $finalAmount;
        $payment->currency = 'XOF';
        $payment->type = $validated['type'];
        $payment->related_id = $relatedId;
        $payment->status = 'pending';
        if ($this->paymentTableHasColumn('description')) {
            $payment->description = $description;
        }

        if ($validated['gateway'] === 'especes') {
            $payment->meta_data = array_filter([
                'notes' => 'Paiement en especes en attente de validation admin',
                'phone_number' => $request->phone_number,
                'promo' => $promoMeta,
            ], fn ($value) => $value !== null);

            $payment->save();
            Log::info('payment.process.saved', [
                'payment_id' => $payment->id,
                'status' => $payment->status,
                'gateway' => $validated['gateway'],
                'amount' => (float) $payment->amount,
            ]);
            $this->consumePromoCode($promoCode);
            $this->notifyPurchaseCreated($payment);
            $this->notifyAdminsOfPendingPayment($payment);
            $this->notifyUserPaymentUpdate(
                $payment,
                'En attente',
                'Votre paiement en especes a ete enregistre. Notre equipe va le confirmer ou le rejeter apres verification.'
            );

            return redirect()->route('payment.success', $payment->id)->with('success', 'Paiement en especes enregistre. En attente de validation admin.');
        }

        if (in_array($validated['gateway'], ['manual', 'mtn_momo', 'flooz'], true)) {
            if (!$request->hasFile('proof_file')) {
                Log::warning('payment.process.manual_missing_proof', [
                    'user_id' => $request->user()?->id,
                    'gateway' => $validated['gateway'],
                    'type' => $validated['type'],
                    'item_id' => $validated['item_id'],
                ]);
                return redirect()->route('payment.failed')->with('error', 'Veuillez telecharger une preuve de paiement.');
            }

            $uploadedFile = $request->file('proof_file');
            $upload = $mediaUploadService->upload($uploadedFile, 'payment-proofs', [
                'max_width' => 1800,
                'quality' => 82,
            ]);

            $payment->meta_data = array_filter([
                'proof_path' => (string) ($upload['url'] ?? ''),
                'proof_media_id' => $upload['asset_id'] ?? null,
                'phone_number' => $request->phone_number,
                'notes' => 'Attente validation manuelle',
                'promo' => $promoMeta,
            ], fn ($value) => $value !== null);

            $payment->save();
            $this->consumePromoCode($promoCode);
            $this->notifyPurchaseCreated($payment);
            $this->notifyAdminsOfPendingPayment($payment);
            $this->notifyUserPaymentUpdate(
                $payment,
                'En attente',
                'Votre preuve de paiement a ete recue. Nous verifierons la transaction puis activerons votre acces.'
            );

            return redirect()->route('payment.success', $payment->id)->with('success', 'Preuve de paiement envoyee. Votre acces sera active apres validation.');
        }

        if ($validated['gateway'] === 'kkiapay') {
            $transactionId = $validated['transaction_id'];

            if (!$transactionId) {
                Log::warning('payment.process.kkiapay_missing_transaction', [
                    'user_id' => $request->user()?->id,
                    'type' => $validated['type'],
                    'item_id' => $validated['item_id'],
                ]);
                return redirect()->route('payment.failed')->with('error', 'ID de transaction Kkiapay manquant.');
            }

            if (app()->environment('local', 'testing', 'staging')) {
                $payment->transaction_id = $transactionId;
                $payment->status = 'completed';
                $payment->meta_data = array_filter([
                    'gateway_response' => 'Test mode - Verified via KkiaPay Widget',
                    'test_mode' => true,
                    'verified_at' => now()->toISOString(),
                    'phone_number' => $validated['phone_number'] ?? null,
                    'promo' => $promoMeta,
                ], fn ($value) => $value !== null);

                $payment->save();
                $this->consumePromoCode($promoCode);
                $this->notifyPurchaseCreated($payment);
                $this->activateService($payment);
                $this->notifyUserPaymentUpdate($payment, 'Valide', 'Votre paiement a ete valide et votre acces est actif.');
                $this->notifyUserInvoice($payment);

                return redirect()->route('payment.success', $payment->id)->with('success', 'Paiement effectue avec succes via Kkiapay.');
            }

            $payment->transaction_id = $transactionId;
            $payment->status = 'pending';
            $payment->meta_data = array_filter([
                'gateway_response' => 'Production mode - Pending verification',
                'test_mode' => false,
                'phone_number' => $validated['phone_number'] ?? null,
                'promo' => $promoMeta,
            ], fn ($value) => $value !== null);

            $payment->save();
            $this->consumePromoCode($promoCode);
            $this->notifyPurchaseCreated($payment);

            return redirect()->route('payment.success', $payment->id)->with('info', 'Paiement en cours de validation.');
        }

        $payment->transaction_id = $validated['transaction_id'] ?? Str::uuid();
        $payment->status = 'completed';
        $payment->meta_data = array_filter([
            'gateway_response' => 'Simulated Success',
            'promo' => $promoMeta,
        ], fn ($value) => $value !== null);

        $this->activateService($payment);
        $payment->save();
        $this->consumePromoCode($promoCode);
        $this->notifyPurchaseCreated($payment);
        $this->notifyUserPaymentUpdate($payment, 'Valide', 'Votre paiement a ete valide et votre acces est actif.');
        $this->notifyUserInvoice($payment);

        Log::info('payment.process.completed', [
            'payment_id' => $payment->id,
            'user_id' => $payment->user_id,
            'status' => $payment->status,
            'gateway' => $payment->payment_method,
            'type' => $payment->type,
            'amount' => (float) $payment->amount,
        ]);

        return redirect()->route('payment.success', $payment->id)->with('success', 'Paiement effectue avec succes.');
    }

    private function activateService(Payment $payment): void
    {
        if ($payment->type === 'subscription') {
            $plan = SubscriptionPlan::find($payment->related_id);

            if (!$plan) {
                return;
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
                'ends_at' => $startsAt->copy()->addDays($plan->duration_days),
                'status' => 'active',
            ]);
        }
    }

    private function ensureDefaultGateways(): void
    {
        $defaults = [
            [
                'name' => 'MTN MoMo',
                'slug' => 'mtn_momo',
                'is_active' => true,
                'logo' => '/images/payments/mtn-momo.png',
                'config' => [
                    ['key' => 'payment_number', 'label' => 'Numero MTN MoMo', 'value' => '22997000000'],
                    ['key' => 'instructions', 'label' => 'Instructions', 'value' => 'Envoyez le montant au numero MTN puis ajoutez votre preuve de paiement.', 'type' => 'textarea'],
                ],
            ],
            [
                'name' => 'Moov Flooz',
                'slug' => 'flooz',
                'is_active' => true,
                'logo' => '/images/payments/flooz.png',
                'config' => [
                    ['key' => 'payment_number', 'label' => 'Numero Flooz', 'value' => '22999000000'],
                    ['key' => 'instructions', 'label' => 'Instructions', 'value' => 'Envoyez le montant par Flooz puis ajoutez votre preuve de paiement.', 'type' => 'textarea'],
                ],
            ],
            [
                'name' => 'Paiement en especes',
                'slug' => 'especes',
                'is_active' => true,
                'logo' => '/images/payments/cash.png',
                'config' => [
                    ['key' => 'instructions', 'label' => 'Instructions', 'value' => 'Passez au siege de LE RURAL pour regler en especes. Votre acces sera active apres validation admin.', 'type' => 'textarea'],
                ],
            ],
            [
                'name' => 'Kkiapay',
                'slug' => 'kkiapay',
                'is_active' => false,
                'logo' => '/images/payments/kkiapay.png',
                'config' => [
                    ['key' => 'public_key', 'label' => 'Cle publique', 'value' => ''],
                    ['key' => 'private_key', 'label' => 'Cle privee', 'value' => '', 'type' => 'password'],
                    ['key' => 'secret', 'label' => 'Secret', 'value' => '', 'type' => 'password'],
                ],
            ],
        ];

        foreach ($defaults as $gateway) {
            PaymentGateway::firstOrCreate(
                ['slug' => $gateway['slug']],
                [
                    'name' => $gateway['name'],
                    'is_active' => $gateway['is_active'],
                    'logo' => $gateway['logo'],
                    'config' => $gateway['config'],
                ],
            );
        }
    }

    public function failed(Request $request)
    {
        $reason = (string) ($request->query('reason') ?? $request->session()->get('error') ?? "Le paiement n'a pas pu etre finalise.");

        return Inertia::render('Payment/Failed', [
            'reason' => $reason,
        ]);
    }

    public function success(Request $request, Payment $payment)
    {
        if ($payment->user_id !== $request->user()->id) {
            abort(403);
        }

        $itemName = null;
        $accessUrl = null;
        $accessLabel = null;

        if ($payment->type === 'article') {
            $article = Article::find($payment->related_id);
            $itemName = $article?->title_fr;
            if ($article && $payment->status === 'completed') {
                $accessUrl = route('article.show', $article->slug);
                $accessLabel = "Lire l'article";
            }
        } elseif ($payment->type === 'subscription') {
            $plan = SubscriptionPlan::find($payment->related_id);
            $itemName = $plan?->name;
        } elseif ($payment->type === 'paper') {
            $paper = PressPaper::find($payment->related_id);
            $itemName = $paper?->title;
            if ($paper && $payment->status === 'completed') {
                $accessUrl = route('press-papers.download', $paper->slug);
                $accessLabel = "Telecharger l'edition";
            }
        }

        return Inertia::render('Payment/Success', [
            'payment' => [
                'id' => $payment->id,
                'status' => $payment->status,
                'amount' => (float) $payment->amount,
                'currency' => $payment->currency,
                'method' => $payment->payment_method,
                'type' => $payment->type,
                'description' => $payment->description,
                'related_name' => $itemName,
                'created_at' => optional($payment->created_at)->toIso8601String(),
                'access_url' => $accessUrl,
                'access_label' => $accessLabel,
            ],
        ]);
    }

    public function history(Request $request)
    {
        $payments = Payment::where('user_id', $request->user()->id)
            ->latest()
            ->get();

        $articles = Article::whereIn('id', $payments->where('type', 'article')->pluck('related_id')->filter()->all())
            ->get(['id', 'title_fr', 'slug'])
            ->keyBy('id');
        $planNames = SubscriptionPlan::whereIn('id', $payments->where('type', 'subscription')->pluck('related_id')->filter()->all())
            ->pluck('name', 'id');
        $papers = PressPaper::whereIn('id', $payments->where('type', 'paper')->pluck('related_id')->filter()->all())
            ->get(['id', 'title', 'slug'])
            ->keyBy('id');

        $serialized = $payments->map(function (Payment $payment) use ($articles, $planNames, $papers) {
            $fallbackByType = match ($payment->type) {
                'article' => 'Achat article',
                'subscription' => 'Abonnement',
                'paper' => 'Nos parutions',
                default => 'Achat',
            };

            $relatedName = null;
            $accessUrl = null;
            $accessLabel = null;

            if ($payment->type === 'article' && isset($articles[$payment->related_id])) {
                $article = $articles[$payment->related_id];
                $relatedName = $article->title_fr;
                $accessUrl = $payment->status === 'completed' ? route('article.show', $article->slug) : null;
                $accessLabel = "Lire l'article";
            } elseif ($payment->type === 'subscription') {
                $relatedName = $planNames[$payment->related_id] ?? null;
            } elseif ($payment->type === 'paper' && isset($papers[$payment->related_id])) {
                $paper = $papers[$payment->related_id];
                $relatedName = $paper->title;
                $accessUrl = $payment->status === 'completed' ? route('press-papers.download', $paper->slug) : null;
                $accessLabel = "Telecharger l'edition";
            }

            return [
                'id' => $payment->id,
                'amount' => (float) $payment->amount,
                'currency' => $payment->currency,
                'status' => $payment->status,
                'date' => $payment->created_at->format('d/m/Y'),
                'description' => $payment->description ?? ($relatedName ? ($fallbackByType . ': ' . $relatedName) : $fallbackByType),
                'method' => $payment->payment_method,
                'type' => $payment->type,
                'related_name' => $relatedName,
                'access_url' => $accessUrl,
                'access_label' => $accessLabel,
                'invoice_url' => $payment->status === 'completed' ? route('user.purchases.invoice', $payment->id) : null,
                'reference' => $payment->reference ?? ('INV-' . str_pad((string) $payment->id, 6, '0', STR_PAD_LEFT)),
            ];
        });

        return Inertia::render('Dashboard/Purchases', [
            'payments' => $serialized,
        ]);
    }

    public function invoice(Request $request, Payment $payment)
    {
        if ($payment->user_id !== $request->user()->id) {
            abort(403);
        }

        if ($payment->status !== 'completed') {
            abort(404);
        }

        $payment->loadMissing('user');

        $itemName = match ($payment->type) {
            'article' => optional(Article::find($payment->related_id))->title_fr,
            'subscription' => optional(SubscriptionPlan::find($payment->related_id))->name,
            'paper' => optional(PressPaper::find($payment->related_id))->title,
            default => null,
        };

        $reference = $payment->reference ?? ('INV-' . str_pad((string) $payment->id, 6, '0', STR_PAD_LEFT));

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('invoices.payment', [
            'payment' => $payment,
            'itemName' => $itemName,
            'reference' => $reference,
            'typeLabel' => match ($payment->type) {
                'article' => 'Article premium',
                'subscription' => 'Abonnement',
                'paper' => 'Journal papier',
                default => 'Achat',
            },
        ]);

        return $pdf->download("facture-{$reference}.pdf");
    }

    private function resolveCheckoutItem(string $type, mixed $id): array
    {
        if ($type === 'article') {
            if (!$id) {
                abort(404);
            }

            $item = Article::where('slug', $id)->orWhere('id', $id)->firstOrFail();

            return [$item->toArray(), (float) $item->price, $item->title_fr];
        }

        if ($type === 'subscription') {
            if (!$id || $id === 'default') {
                $item = SubscriptionPlan::orderBy('price', 'asc')->firstOrFail();
            } else {
                $item = SubscriptionPlan::where('slug', $id)->orWhere('id', $id)->firstOrFail();
            }

            return [$item->toArray(), (float) $item->price, $item->name];
        }

        if ($type === 'paper') {
            if (!$id) {
                abort(404);
            }

            $item = PressPaper::where('slug', $id)
                ->orWhere('id', $id)
                ->published()
                ->firstOrFail();

            return [$item->toArray(), (float) $item->price, $item->title];
        }

        abort(404);
    }

    private function notifyPurchaseCreated(Payment $payment): void
    {
        try {
            $payment->loadMissing('user');

            $recipients = app(NotificationRecipientService::class)->adminAndFooterEmails();
            if (empty($recipients)) {
                return;
            }

            Mail::to($recipients)->send(new PurchaseCreatedAlert($payment));
        } catch (\Throwable $exception) {
            report($exception);
        }
    }
    private function notifyAdminsOfPendingPayment(Payment $payment): void
    {
        try {
            $payment->loadMissing('user');

            $adminEmails = User::query()
                ->where('role', User::ROLE_ADMIN)
                ->pluck('email')
                ->filter()
                ->values()
                ->all();

            if (empty($adminEmails)) {
                return;
            }

            Mail::to($adminEmails)->send(new PaymentSubmittedAdmin($payment));
        } catch (\Throwable $exception) {
            report($exception);
        }
    }

    private function notifyUserPaymentUpdate(Payment $payment, string $statusLabel, ?string $customMessage = null): void
    {
        try {
            $payment->loadMissing('user');

            if (!$payment->user?->email) {
                return;
            }

            Mail::to($payment->user->email)->send(new PaymentStatusUpdated($payment, $statusLabel, $customMessage));
        } catch (\Throwable $exception) {
            report($exception);
        }
    }

    private function notifyUserInvoice(Payment $payment): void
    {
        try {
            $payment->loadMissing('user');

            if ($payment->status !== 'completed' || !$payment->user?->email) {
                return;
            }

            Mail::to($payment->user->email)->send(new PurchaseInvoice($payment));
        } catch (\Throwable $exception) {
            report($exception);
        }
    }
    private function consumePromoCode(?PromoCode $promoCode): void
    {
        if (!$promoCode) {
            return;
        }

        $promoCode->increment('used_count');
    }

    private function resolvePaymentItem(string $type, mixed $itemId): array
    {
        if ($type === 'article') {
            $article = Article::where('slug', $itemId)->orWhere('id', $itemId)->firstOrFail();

            return [(float) $article->price, $article->id, 'Achat article: ' . $article->title_fr];
        }

        if ($type === 'subscription') {
            $plan = SubscriptionPlan::where('slug', $itemId)->orWhere('id', $itemId)->firstOrFail();

            return [(float) $plan->price, $plan->id, 'Abonnement: ' . $plan->name];
        }

        $paper = PressPaper::where('slug', $itemId)
            ->orWhere('id', $itemId)
            ->published()
            ->firstOrFail();

        return [(float) $paper->price, $paper->id, 'Nos parutions: ' . $paper->title];
    }

    private function paymentTableHasColumn(string $column): bool
    {
        static $cache = [];

        if (array_key_exists($column, $cache)) {
            return $cache[$column];
        }

        return $cache[$column] = Schema::hasColumn('payments', $column);
    }
}


















