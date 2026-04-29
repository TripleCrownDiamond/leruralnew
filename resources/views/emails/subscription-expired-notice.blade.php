@component('emails.layouts.base', ['headline' => 'Votre abonnement a expire', 'eyebrow' => 'LE RURAL / Abonnement'])
<p style="margin:0 0 14px;font-size:14px;line-height:1.6;">Bonjour {{ $subscription->user?->name }}, votre abonnement <strong>{{ $subscription->plan?->name }}</strong> a expire le <strong>{{ optional($subscription->ends_at)->format('d/m/Y H:i') }}</strong>.</p>
<p style="margin:0 0 14px;font-size:14px;line-height:1.6;">Renouvelez votre abonnement pour retrouver l'acces aux contenus premium.</p>
<p style="margin:0;"><a href="{{ route('payment.checkout', ['type' => 'subscription', 'id' => $subscription->plan?->slug ?? $subscription->subscription_plan_id]) }}" style="display:inline-block;background:#2f6a11;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;">Renouveler</a></p>
@endcomponent
