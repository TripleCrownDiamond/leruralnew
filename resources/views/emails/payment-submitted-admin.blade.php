@component('emails.layouts.base', ['headline' => 'Nouveau paiement en attente', 'eyebrow' => 'LE RURAL / Paiements'])
<p style="margin:0 0 14px;font-size:14px;line-height:1.6;">Un client a soumis un paiement qui attend une validation admin.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
<tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:13px;"><strong>ID paiement:</strong> #{{ $payment->id }}</td></tr>
<tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:13px;"><strong>Client:</strong> {{ $payment->user?->name }} ({{ $payment->user?->email }})</td></tr>
<tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:13px;"><strong>Montant:</strong> {{ number_format((float) $payment->amount, 0, ',', ' ') }} {{ $payment->currency }}</td></tr>
<tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:13px;"><strong>Methode:</strong> {{ strtoupper($payment->payment_method) }}</td></tr>
<tr><td style="padding:8px 0;font-size:13px;"><strong>Type:</strong> {{ $payment->type }}</td></tr>
</table>
@endcomponent
