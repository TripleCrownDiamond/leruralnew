<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        // Check for purchase data from URL parameter
        $purchaseData = null;
        if ($request->has('purchase')) {
            try {
                $purchaseData = json_decode(base64_decode(urldecode($request->get('purchase'))), true);
                
                // Store purchase data in session for email verification
                if ($purchaseData && isset($purchaseData['type'])) {
                    $request->session()->put('pending_purchase', $purchaseData);
                    $request->session()->put('purchase_from_registration', true);
                }
            } catch (\Exception $e) {
                // Invalid purchase data, ignore
            }
        }

        // Check for intended URL in session (saved by PaymentController or others)
        if ($request->session()->has('url.intended')) {
            return redirect($request->session()->get('url.intended'));
        }

        return redirect(route('dashboard', absolute: false));
    }
}
