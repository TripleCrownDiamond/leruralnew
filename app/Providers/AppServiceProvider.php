<?php

namespace App\Providers;

use App\Models\Agenda;
use App\Models\Category;
use App\Models\Poll;
use App\Models\PromoCode;
use App\Models\Setting;
use App\Models\StaticPage;
use App\Observers\CacheInvalidationObserver;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

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
        // Toute URL generee part de l'hote canonique, quel que soit l'hote de
        // la requete. Sans cela, un lien de verification cree depuis
        // lerural.com etait signe pour ce domaine puis redirige vers
        // lerural.bj : la signature ne correspondait plus et le destinataire
        // recevait un 403 en cliquant.
        if (filled(config('app.url'))) {
            \Illuminate\Support\Facades\URL::forceRootUrl(config('app.url'));

            if (str_starts_with((string) config('app.url'), 'https://')) {
                \Illuminate\Support\Facades\URL::forceScheme('https');
            }
        }

        Vite::prefetch(concurrency: 3);

                // Register cache invalidation observers
        Setting::observe(CacheInvalidationObserver::class);
        Category::observe(CacheInvalidationObserver::class);
        StaticPage::observe(CacheInvalidationObserver::class);
        PromoCode::observe(CacheInvalidationObserver::class);
        Poll::observe(CacheInvalidationObserver::class);
        Agenda::observe(CacheInvalidationObserver::class);

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
