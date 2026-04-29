<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        // Check for purchase data from URL parameter
        if ($request->has('purchase')) {
            try {
                $purchaseData = json_decode(base64_decode(urldecode($request->get('purchase'))), true);
                
                // Store purchase data in session for potential email verification
                if ($purchaseData && isset($purchaseData['type'])) {
                    $request->session()->put('pending_purchase', $purchaseData);
                    $request->session()->put('purchase_from_login', true);
                    
                    // If email is already verified, redirect directly to checkout
                    if ($request->user()->hasVerifiedEmail()) {
                        $request->session()->forget('pending_purchase');
                        $request->session()->forget('purchase_from_login');
                        
                        $checkoutUrl = $this->getCheckoutUrl($purchaseData);
                        return redirect($checkoutUrl);
                    }
                }
            } catch (\Exception $e) {
                // Invalid purchase data, ignore
            }
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Get checkout URL based on purchase type
     */
    private function getCheckoutUrl(array $purchaseData): string
    {
        $type = $purchaseData['type'] ?? 'subscription';
        
        if ($type === 'article') {
            $articleId = $purchaseData['articleSlug'] ?? $purchaseData['articleId'] ?? '';
            return route('payment.checkout', ['type' => 'article', 'id' => $articleId]);
        }
        
        // Pour les abonnements, utiliser 'default' comme ID
        return route('payment.checkout', ['type' => 'subscription', 'id' => 'default']);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/login');
    }
}
