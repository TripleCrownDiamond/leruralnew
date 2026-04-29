<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Payment;
use App\Models\Article;
use App\Models\SubscriptionPlan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class KkiapayController extends Controller
{
    /**
     * Handle Kkiapay callback with security verification
     */
    public function callback(Request $request)
    {
        Log::info('🔔 Kkiapay Webhook Received:', [
            'method' => $request->method(),
            'headers' => $request->headers->all(),
            'data' => $request->all(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);
        
        try {
            // Vérification de sécurité du webhook
            $webhookSecret = env('KKIAPAY_WEBHOOK_SECRET');
            
            if (!$webhookSecret) {
                Log::error('❌ Kkiapay webhook secret not configured in .env');
                return response()->json([
                    'error' => 'Webhook secret not configured',
                    'message' => 'Veuillez configurer KKIAPAY_WEBHOOK_SECRET dans .env'
                ], 500);
            }
            
            // Récupérer le hash envoyé par Kkiapay
            $receivedHash = $request->header('X-Kkiapay-Signature');
            
            if (!$receivedHash) {
                Log::error('❌ Kkiapay webhook signature missing');
                return response()->json(['error' => 'Signature missing'], 401);
            }
            
            // Calculer le hash attendu
            $payload = $request->getContent();
            $expectedHash = hash_hmac('sha256', $payload, $webhookSecret);
            
            // Vérifier le hash avec timing-safe comparison
            if (!hash_equals($expectedHash, $receivedHash)) {
                Log::error('❌ Kkiapay webhook signature invalid', [
                    'received' => $receivedHash,
                    'expected' => $expectedHash,
                    'payload_length' => strlen($payload)
                ]);
                return response()->json(['error' => 'Invalid signature'], 401);
            }
            
            Log::info('✅ Kkiapay webhook signature verified successfully');
            
            // Extraire les données du paiement
            $transactionId = $request->input('transaction_id');
            $status = $request->input('status'); // SUCCESS, FAILED
            $amount = $request->input('amount');
            $data = $request->input('data'); // payment_type_item_slug
            
            if (!$transactionId || !$status) {
                Log::error('❌ Kkiapay callback: Missing required data', [
                    'transaction_id' => $transactionId,
                    'status' => $status
                ]);
                return response()->json(['error' => 'Missing required data'], 400);
            }
            
            // Parser les données du paiement
            $paymentData = explode('_', $data ?? '');
            if (count($paymentData) < 3) {
                Log::error('❌ Kkiapay callback: Invalid data format', ['data' => $data]);
                return response()->json(['error' => 'Invalid data format'], 400);
            }
            
            $type = $paymentData[1]; // article ou subscription
            $itemSlug = $paymentData[2]; // slug de l'article ou plan
            
            // Trouver l'utilisateur
            $user = Auth::user();
            if (!$user) {
                Log::error('❌ Kkiapay callback: User not authenticated');
                return response()->json(['error' => 'User not authenticated'], 401);
            }
            
            // Résoudre l'item et le montant
            $relatedId = null;
            $expectedAmount = 0;
            $description = '';
            
            if ($type === 'article') {
                $article = Article::where('slug', $itemSlug)->first();
                if (!$article) {
                    Log::error('❌ Kkiapay callback: Article not found', ['slug' => $itemSlug]);
                    return response()->json(['error' => 'Article not found'], 404);
                }
                $relatedId = $article->id;
                $expectedAmount = $article->price;
                $description = "Achat article: " . $article->title_fr;
            } elseif ($type === 'subscription') {
                $plan = SubscriptionPlan::where('slug', $itemSlug)->first();
                if (!$plan) {
                    Log::error('❌ Kkiapay callback: Subscription plan not found', ['slug' => $itemSlug]);
                    return response()->json(['error' => 'Subscription plan not found'], 404);
                }
                $relatedId = $plan->id;
                $expectedAmount = $plan->price;
                $description = "Abonnement: " . $plan->name;
            } else {
                Log::error('❌ Kkiapay callback: Invalid payment type', ['type' => $type]);
                return response()->json(['error' => 'Invalid payment type'], 400);
            }
            
            // Vérifier le montant (optionnel, pour la sécurité)
            if ($amount && $amount != $expectedAmount) {
                Log::warning('⚠️ Kkiapay callback: Amount mismatch', [
                    'expected' => $expectedAmount,
                    'received' => $amount,
                    'transaction_id' => $transactionId
                ]);
            }
            
            // Créer ou mettre à jour le paiement
            $payment = Payment::where('transaction_id', $transactionId)->first();
            
            if (!$payment) {
                $payment = new Payment();
                $payment->user_id = $user->id;
                $payment->transaction_id = $transactionId;
            }
            
            $payment->payment_method = 'kkiapay';
            $payment->amount = $amount ?? $expectedAmount;
            $payment->currency = 'XOF';
            $payment->type = $type;
            $payment->related_id = $relatedId;
            $payment->status = strtolower($status) === 'success' ? 'completed' : 'failed';
            $payment->meta_data = [
                'gateway_response' => $request->all(),
                'callback_received_at' => now()->toISOString(),
                'webhook_verified' => true
            ];
            
            $payment->save();
            
            // Si le paiement est réussi, activer le service
            if ($payment->status === 'completed') {
                $this->activateService($payment);
                
                Log::info('✅ Kkiapay payment successful:', [
                    'transaction_id' => $transactionId,
                    'user_id' => $user->id,
                    'type' => $type,
                    'amount' => $amount
                ]);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Paiement effectué avec succès',
                    'transaction_id' => $transactionId,
                    'redirect' => route('dashboard')
                ]);
            } else {
                Log::warning('⚠️ Kkiapay payment failed:', [
                    'transaction_id' => $transactionId,
                    'status' => $status
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Paiement échoué'
                ]);
            }
            
        } catch (\Exception $e) {
            \Log::error('Kkiapay callback error: ' . $e->getMessage(), [
                'request' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du traitement du paiement'
            ], 500);
        }
    }
    
    /**
     * Activer le service après paiement réussi
     */
    private function activateService(Payment $payment)
    {
        $user = $payment->user;
        
        if ($payment->type === 'article') {
            // Activer l'accès à l'article
            $user->articles()->attach($payment->related_id, [
                'payment_id' => $payment->id,
                'access_granted_at' => now(),
                'expires_at' => null // Accès permanent pour les articles
            ]);
            
        } elseif ($payment->type === 'subscription') {
            // Activer l'abonnement
            $subscription = $user->subscriptions()->create([
                'subscription_plan_id' => $payment->related_id,
                'payment_id' => $payment->id,
                'status' => 'active',
                'starts_at' => now(),
                'expires_at' => now()->addMonth(), // Par défaut 1 mois
                'auto_renew' => false
            ]);
            
            // Donner accès à tous les articles premium pendant la durée de l'abonnement
            $user->articles()->syncWithoutDetaching(
                Article::where('is_premium', true)->pluck('id')->map(function($articleId) use ($subscription) {
                    return [
                        'article_id' => $articleId,
                        'subscription_id' => $subscription->id,
                        'access_granted_at' => now(),
                        'expires_at' => $subscription->expires_at
                    ];
                })
            );
        }
    }
}
