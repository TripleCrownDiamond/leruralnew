<?php

namespace App\Http\Controllers\Admin;

use App\Models\PaymentGateway;
use App\Services\MediaUploadService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentGatewayController extends AdminController
{
    public function __construct(private readonly MediaUploadService $mediaUploadService)
    {
        parent::__construct();
    }

    public function index()
    {
        $this->ensureDefaultGateways();

        return Inertia::render('Admin/Settings/Payment', [
            'gateways' => PaymentGateway::orderBy('name')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Settings/PaymentGatewayCreate');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:payment_gateways,slug'],
            'is_active' => ['boolean'],
            'logo' => ['nullable'],
            'config' => ['nullable', 'array'],
        ]);

        $logoUrl = null;
        if ($request->hasFile('logo')) {
            $upload = $this->mediaUploadService->upload($request->file('logo'), 'gateways', [
                'max_width' => 800,
                'quality' => 84,
            ]);
            $logoUrl = $upload['url'];
        } elseif (is_string($request->logo)) {
            $logoUrl = $request->logo;
        }

        PaymentGateway::create([
            'name' => trim($validated['name']),
            'slug' => trim($validated['slug']),
            'is_active' => (bool) ($validated['is_active'] ?? false),
            'logo' => $logoUrl,
            'config' => $validated['config'] ?? [],
        ]);

        return redirect()->route('dashboard.settings.payment')
            ->with('success', 'Methode de paiement ajoutee avec succes.');
    }

    public function update(Request $request, PaymentGateway $gateway)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'is_active' => ['boolean'],
            'logo' => ['nullable'],
            'config' => ['nullable', 'array'],
        ]);

        if ($request->hasFile('logo')) {
            $upload = $this->mediaUploadService->upload($request->file('logo'), 'gateways', [
                'max_width' => 800,
                'quality' => 84,
            ]);
            $validated['logo'] = $upload['url'];
        } elseif (is_string($request->logo) && $request->logo !== '') {
            $validated['logo'] = $request->logo;
        } else {
            unset($validated['logo']);
        }

        $gateway->update([
            'name' => trim($validated['name']),
            'is_active' => (bool) ($validated['is_active'] ?? false),
            'logo' => $validated['logo'] ?? $gateway->logo,
            'config' => $validated['config'] ?? [],
        ]);

        return back()->with('success', 'Configuration mise a jour.');
    }

    public function uploadLogo(Request $request)
    {
        $request->validate([
            'file' => ['required', 'image', 'max:4096'],
        ]);

        $upload = $this->mediaUploadService->upload($request->file('file'), 'gateways', [
            'max_width' => 800,
            'quality' => 84,
        ]);

        return response()->json([
            'secure_url' => $upload['url'],
        ]);
    }

    public function destroy(PaymentGateway $gateway)
    {
        $gateway->delete();

        return back()->with('success', 'Methode de paiement supprimee.');
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
            [
                'name' => 'Fedapay',
                'slug' => 'fedapay',
                'is_active' => false,
                'logo' => '/images/payments/fedapay.png',
                'config' => [
                    ['key' => 'public_key', 'label' => 'Cle publique', 'value' => ''],
                    ['key' => 'secret_key', 'label' => 'Cle secrete', 'value' => '', 'type' => 'password'],
                ],
            ],
            [
                'name' => 'Qosic',
                'slug' => 'qosic',
                'is_active' => false,
                'logo' => '/images/payments/qosic.png',
                'config' => [
                    ['key' => 'username', 'label' => 'Username API', 'value' => ''],
                    ['key' => 'password', 'label' => 'Password API', 'value' => '', 'type' => 'password'],
                    ['key' => 'service_id', 'label' => 'Service ID', 'value' => ''],
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
                ]
            );
        }
    }
}
