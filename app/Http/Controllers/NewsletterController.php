<?php

namespace App\Http\Controllers;

use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

class NewsletterController extends Controller
{
    public function subscribe(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $subscriber = NewsletterSubscriber::firstOrNew(['email' => $request->email]);
        
        $subscriber->ip_address = $request->ip();
        $subscriber->user_agent = $request->userAgent();
        
        if (!$subscriber->exists) {
            $subscriber->is_active = true;
            $subscriber->save();
            return Redirect::back()->with('success', 'Merci de vous être abonné à notre newsletter !');
        }

        if (!$subscriber->is_active) {
            $subscriber->is_active = true;
            $subscriber->unsubscribed_at = null;
            $subscriber->save();
            return Redirect::back()->with('success', 'Votre abonnement a été réactivé avec succès !');
        }

        return Redirect::back()->with('info', 'Vous êtes déjà abonné à notre newsletter.');
    }
}
