@component('emails.layouts.base', ['headline' => 'Mise a jour de votre paiement', 'eyebrow' => 'LE RURAL / Facturation'])
<p style="margin:0 0 14px;font-size:14px;line-height:1.6;">Statut actuel: <strong>{{ $statusLabel }}</strong></p>
@if($customMessage)
<p style="margin:0 0 14px;font-size:13px;line-height:1.6;color:#374151;">{{ $customMessage }}</p>
@endif
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
<tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:13px;"><strong>Reference paiement:</strong> #{{ $payment->id }}</td></tr>
<tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:13px;"><strong>Montant:</strong> {{ number_format((float) $payment->amount, 0, ',', ' ') }} {{ $payment->currency }}</td></tr>
<tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:13px;"><strong>Methode:</strong> {{ strtoupper($payment->payment_method) }}</td></tr>
<tr><td style="padding:8px 0;font-size:13px;"><strong>Type:</strong> {{ $payment->type }}</td></tr>
</table>
@endcomponent
