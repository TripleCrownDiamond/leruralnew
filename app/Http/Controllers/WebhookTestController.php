<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookTestController extends Controller
{
    /**
     * Recevoir les webhooks Kkiapay pour tests
     */
    public function kkiapayCallback(Request $request)
    {
        // Logger toutes les données reçues
        Log::info('🔔 Kkiapay Webhook Received:', [
            'method' => $request->method(),
            'headers' => $request->headers->all(),
            'data' => $request->all(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        // Vérifier la signature Kkiapay si disponible
        $signature = $request->header('X-Kkiapay-Signature');
        if ($signature) {
            Log::info('🔐 Kkiapay Signature:', ['signature' => $signature]);
        }

        // Traiter les données du webhook
        $transactionId = $request->input('transaction_id');
        $status = $request->input('status');
        $amount = $request->input('amount');

        if ($transactionId && $status) {
            Log::info('💰 Payment Webhook Data:', [
                'transaction_id' => $transactionId,
                'status' => $status,
                'amount' => $amount,
                'timestamp' => now()
            ]);

            // Simuler le traitement du paiement
            if (strtolower($status) === 'success') {
                Log::success('✅ Payment Successful:', [
                    'transaction_id' => $transactionId,
                    'amount' => $amount
                ]);
            } else {
                Log::warning('⚠️ Payment Failed:', [
                    'transaction_id' => $transactionId,
                    'status' => $status
                ]);
            }

            // Répondre à Kkiapay
            return response()->json([
                'status' => 'received',
                'message' => 'Webhook received successfully',
                'transaction_id' => $transactionId
            ]);
        }

        Log::error('❌ Invalid Webhook Data:', $request->all());

        return response()->json([
            'status' => 'error',
            'message' => 'Invalid webhook data'
        ], 400);
    }

    /**
     * Page de test pour voir les webhooks reçus
     */
    public function showWebhooks()
    {
        // Lire les logs récents
        $logFile = storage_path('logs/laravel.log');
        $webhooks = [];

        if (file_exists($logFile)) {
            $lines = file($logFile);
            $recentLines = array_slice($lines, -50); // 50 dernières lignes

            foreach ($recentLines as $line) {
                if (strpos($line, 'Kkiapay Webhook') !== false) {
                    $webhooks[] = trim($line);
                }
            }
        }

        return view('webhooks.test', [
            'webhooks' => array_reverse($webhooks),
            'total' => count($webhooks)
        ]);
    }

    /**
     * Endpoint de test pour simuler un webhook Kkiapay
     */
    public function simulateWebhook(Request $request)
    {
        $testData = [
            'transaction_id' => 'TEST_' . time(),
            'status' => $request->input('status', 'success'),
            'amount' => $request->input('amount', 5000),
            'phone' => $request->input('phone', '+22912345678'),
            'timestamp' => now()->toISOString()
        ];

        Log::info('🧪 Simulated Kkiapay Webhook:', $testData);

        return response()->json([
            'status' => 'simulated',
            'data' => $testData
        ]);
    }
}
