<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Route;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return $this->handleRedirect($request);
        }

        if ($request->user()->markEmailAsVerified()) {
            event(new Verified($request->user()));
        }

        return $this->handleRedirect($request);
    }

    /**
     * Handle redirection after email verification
     */
    private function handleRedirect(EmailVerificationRequest $request): RedirectResponse
    {
        $session = $request->session();
        
        // Check if there's a pending purchase from registration
        if ($session->has('pending_purchase') && $session->get('purchase_from_registration')) {
            $purchaseData = $session->get('pending_purchase');
            
            // Clear session data
            $session->forget('pending_purchase');
            $session->forget('purchase_from_registration');
            
            // Redirect to checkout
            $checkoutUrl = $this->getCheckoutUrl($purchaseData);
            return redirect($checkoutUrl);
        }
        
        // Check if there's a pending purchase from login
        if ($session->has('pending_purchase') && $session->get('purchase_from_login')) {
            $purchaseData = $session->get('pending_purchase');
            
            // Clear session data
            $session->forget('pending_purchase');
            $session->forget('purchase_from_login');
            
            // Redirect to checkout
            $checkoutUrl = $this->getCheckoutUrl($purchaseData);
            return redirect($checkoutUrl);
        }
        
        // Check for intended URL (normal registration or other flows)
        if ($session->has('url.intended')) {
            $intendedUrl = $session->get('url.intended');
            $session->forget('url.intended');
            return redirect($intendedUrl);
        }
        
        // Default redirect to dashboard with verification flag
        return redirect()->intended(route('dashboard', absolute: false).'?verified=1');
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
}
