<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function payment()
    {
        $settings = Setting::where('group', 'payment')->get()->pluck('value', 'key');
        
        return Inertia::render('Admin/Settings/Payment', [
            'settings' => $settings
        ]);
    }

    public function updatePayment(Request $request)
    {
        $data = $request->validate([
            'kkiapay_active' => 'boolean',
            'kkiapay_public_key' => 'nullable|string',
            'kkiapay_private_key' => 'nullable|string',
            'kkiapay_secret' => 'nullable|string',
            
            'fedapay_active' => 'boolean',
            'fedapay_public_key' => 'nullable|string',
            'fedapay_secret_key' => 'nullable|string',
            
            'manual_payment_active' => 'boolean',
            'manual_payment_number' => 'nullable|string',
            'manual_payment_instructions' => 'nullable|string',
        ]);

        foreach ($data as $key => $value) {
            // Convert boolean to string for storage
            if (is_bool($value)) {
                $value = $value ? '1' : '0';
            }
            
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value, 'group' => 'payment']
            );
        }

        return back()->with('success', 'Paramètres de paiement mis à jour.');
    }
}