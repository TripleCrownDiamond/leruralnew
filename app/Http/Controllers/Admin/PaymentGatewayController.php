<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentGateway;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

use Illuminate\Support\Facades\Http;

class PaymentGatewayController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // On s'assure que les données de base sont là
        if (PaymentGateway::count() === 0) {
            $this->seedGateways();
        }

        return Inertia::render('Admin/Settings/Payment', [
            'gateways' => PaymentGateway::all()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:payment_gateways',
            'is_active' => 'boolean',
            'logo' => 'nullable', // Can be file or string
            'config' => 'nullable|array', // Structure: [{key: 'public_key', label: 'Clé Publique', value: '...'}]
        ]);

        $logoUrl = null;
        if ($request->hasFile('logo')) {
            $logoUrl = $this->uploadToCloudinary($request->file('logo'));
        } elseif (is_string($request->logo)) {
            $logoUrl = $request->logo;
        }

        PaymentGateway::create([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'is_active' => $validated['is_active'],
            'logo' => $logoUrl,
            'config' => $validated['config']
        ]);

        return back()->with('success', 'Méthode de paiement ajoutée.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PaymentGateway $gateway)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'is_active' => 'boolean',
            'logo' => 'nullable', // Can be file or string
            'config' => 'nullable|array',
        ]);

        if ($request->hasFile('logo')) {
            $validated['logo'] = $this->uploadToCloudinary($request->file('logo'));
        } elseif (is_string($request->logo) && !empty($request->logo)) {
             // If logo is a string (URL), keep it
             $validated['logo'] = $request->logo;
        } else {
             // If logo is not provided or null, remove it from update to keep existing
             unset($validated['logo']);
        }

        $gateway->update($validated);

        return back()->with('success', 'Configuration mise à jour.');
    }

    /**
     * Upload logo via API for frontend
     */
    public function uploadLogo(Request $request)
    {
        try {
            $request->validate([
                'file' => 'required|image|max:2048',
            ]);

            $url = $this->uploadToCloudinary($request->file('file'));

            return response()->json([
                'secure_url' => $url
            ]);
        } catch (\Exception $e) {
            \Log::error('Upload logo error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur serveur: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload image to Cloudinary
     */
    private function uploadToCloudinary($file)
    {
        $cloudName = env('VITE_CLOUDINARY_CLOUD_NAME');
        $uploadPreset = env('VITE_CLOUDINARY_UPLOAD_PRESET');
        
        if (!$cloudName || !$uploadPreset) {
            // Fallback to local storage if Cloudinary is not configured
            return '/storage/' . $file->store('gateways', 'public');
        }

        try {
            $response = Http::attach(
                'file', file_get_contents($file->getRealPath()), $file->getClientOriginalName()
            )->post("https://api.cloudinary.com/v1_1/{$cloudName}/image/upload", [
                'upload_preset' => $uploadPreset,
                'folder' => 'gateways',
                'transformation' => 'w_400,h_400,c_fill,q_auto,f_auto' // Resize to square, optimize quality and format
            ]);

            if ($response->successful()) {
                return $response->json()['secure_url'];
            } else {
                \Log::error('Cloudinary upload failed: ' . $response->body());
                // Fallback to local on cloudinary error
                return '/storage/' . $file->store('gateways', 'public');
            }
        } catch (\Exception $e) {
            \Log::error('Cloudinary upload exception: ' . $e->getMessage());
            // Fallback to local on exception
            return '/storage/' . $file->store('gateways', 'public');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PaymentGateway $gateway)
    {
        $gateway->delete();
        return back()->with('success', 'Méthode de paiement supprimée.');
    }

    /**
     * Helper to migrate from old settings table to new gateways table
     */
    private function seedGateways()
    {
        $settings = Setting::where('group', 'payment')->pluck('value', 'key');

        // KkiaPay
        PaymentGateway::create([
            'name' => 'KkiaPay',
            'slug' => 'kkiapay',
            'is_active' => ($settings['kkiapay_active'] ?? '0') === '1',
            'logo' => '/images/payments/kkiapay.png',
            'config' => [
                ['key' => 'public_key', 'label' => 'Clé Publique', 'value' => $settings['kkiapay_public_key'] ?? ''],
                ['key' => 'private_key', 'label' => 'Clé Privée', 'value' => $settings['kkiapay_private_key'] ?? '', 'type' => 'password'],
                ['key' => 'secret', 'label' => 'Secret', 'value' => $settings['kkiapay_secret'] ?? '', 'type' => 'password'],
            ]
        ]);

        // FedaPay
        PaymentGateway::create([
            'name' => 'FedaPay',
            'slug' => 'fedapay',
            'is_active' => ($settings['fedapay_active'] ?? '0') === '1',
            'logo' => '/images/payments/fedapay.png',
            'config' => [
                ['key' => 'public_key', 'label' => 'Clé Publique', 'value' => $settings['fedapay_public_key'] ?? ''],
                ['key' => 'secret_key', 'label' => 'Clé Secrète', 'value' => $settings['fedapay_secret_key'] ?? '', 'type' => 'password'],
            ]
        ]);

        // Manual
        PaymentGateway::create([
            'name' => 'Paiement Manuel (Mobile Money)',
            'slug' => 'manual',
            'is_active' => ($settings['manual_payment_active'] ?? '0') === '1',
            'logo' => '/images/payments/manual.png',
            'config' => [
                ['key' => 'payment_number', 'label' => 'Numéros de téléphone', 'value' => $settings['manual_payment_number'] ?? ''],
                ['key' => 'instructions', 'label' => 'Instructions', 'value' => $settings['manual_payment_instructions'] ?? '', 'type' => 'textarea'],
            ]
        ]);
    }
}