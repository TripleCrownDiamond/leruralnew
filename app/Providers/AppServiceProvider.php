<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Auth\Notifications\ResetPassword;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Customize Verify Email Notification
        VerifyEmail::toMailUsing(function (object $notifiable, string $url) {
            return (new MailMessage)
                ->subject('Verifiez votre adresse email - ' . config('app.name'))
                ->view('emails.verify-email', ['user' => $notifiable, 'url' => $url]);
        });

        // Customize Reset Password Notification
        ResetPassword::toMailUsing(function (object $notifiable, string $token) {
            $url = url(route('password.reset', [
                'token' => $token,
                'email' => $notifiable->getEmailForPasswordReset(),
            ], false));

            return (new MailMessage)
                ->subject('Reinitialisation de votre mot de passe - ' . config('app.name'))
                ->view('emails.reset-password', [
                    'user' => $notifiable,
                    'url' => $url,
                    'minutes' => config('auth.passwords.users.expire'),
                ]);
        });
    }
}
