@extends('layouts.app')

@section('content')
<div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            🪝 Webhook Testing - Kkiapay
        </h1>

        <!-- Configuration ngrok -->
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
            <h2 class="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
                🚀 Configuration ngrok (Recommandé)
            </h2>
            
            <div class="space-y-3 text-sm">
                <p class="text-blue-800 dark:text-blue-200">
                    <strong>1. Installer ngrok :</strong>
                </p>
                <pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto"><code>npm install ngrok -g</code></pre>
                
                <p class="text-blue-800 dark:text-blue-200">
                    <strong>2. Démarrer ngrok :</strong>
                </p>
                <pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto"><code>ngrok http 5173</code></pre>
                
                <p class="text-blue-800 dark:text-blue-200">
                    <strong>3. Copier l'URL ngrok (ex: https://abc123.ngrok.io)
                </p>
                
                <p class="text-blue-800 dark:text-blue-200">
                    <strong>4. Configurer dans Kkiapay :</strong>
                </p>
                <pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto"><code>https://abc123.ngrok.io/payment/kkiapay/callback</code></pre>
            </div>
        </div>

        <!-- Test Simulation -->
        <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-8">
            <h2 class="text-xl font-semibold text-green-900 dark:text-green-100 mb-4">
                🧪 Simulation de Webhook
            </h2>
            
            <form method="POST" action="{{ route('webhook.simulate') }}" class="space-y-4">
                @csrf
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Status
                        </label>
                        <select name="status" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                            <option value="success">✅ Success</option>
                            <option value="failed">❌ Failed</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Amount
                        </label>
                        <input type="number" name="amount" value="5000" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Phone
                        </label>
                        <input type="text" name="phone" value="+22912345678" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    </div>
                </div>
                
                <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
                    🧪 Simuler Webhook
                </button>
            </form>
        </div>

        <!-- Webhooks Reçus -->
        <div class="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                📋 Webhooks Reçus ({{ $total }} récents)
            </h2>
            
            @if($webhooks->isEmpty())
                <p class="text-gray-500 dark:text-gray-400 text-center py-8">
                    Aucun webhook reçu. Effectuez un paiement ou utilisez la simulation ci-dessus.
                </p>
            @else
                <div class="space-y-3 max-h-96 overflow-y-auto">
                    @foreach($webhooks as $webhook)
                        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-3">
                            <pre class="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ $webhook }}</pre>
                        </div>
                    @endforeach
                </div>
            @endif
        </div>

        <!-- Instructions -->
        <div class="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-3">
                📝 Instructions Complètes
            </h3>
            
            <div class="space-y-3 text-sm text-yellow-800 dark:text-yellow-200">
                <div>
                    <strong>🔧 Étape 1 : Démarrer ngrok</strong>
                    <p>Ouvrez un terminal et lancez : <code>ngrok http 5173</code></p>
                </div>
                
                <div>
                    <strong>🔧 Étape 2 : Configurer Kkiapay</strong>
                    <p>Dans votre dashboard Kkiapay, ajoutez l'URL ngrok comme webhook.</p>
                </div>
                
                <div>
                    <strong>🔧 Étape 3 : Tester</strong>
                    <p>Effectuez un paiement ou utilisez la simulation ci-dessus.</p>
                </div>
                
                <div>
                    <strong>🔧 Étape 4 : Vérifier</strong>
                    <p>Les webhooks apparaîtront dans cette page et dans les logs Laravel.</p>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
