@component('emails.layouts.base', ['headline' => 'Nouvel achat enregistre', 'eyebrow' => 'LE RURAL / Paiements'])
<p style="margin:0 0 14px;font-size:14px;line-height:1.6;">Un nouvel achat a ete enregistre sur la plateforme.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
<tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:13px;"><strong>ID paiement:</strong> #{{ $payment->id }}</td></tr>
<tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:13px;"><strong>Client:</strong> {{ $payment->user?->name }} ({{ $payment->user?->email }})</td></tr>
<tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:13px;"><strong>Montant:</strong> {{ number_format((float) $payment->amount, 0, ',', ' ') }} {{ $payment->currency }}</td></tr>
<tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:13px;"><strong>Statut:</strong> {{ strtoupper($payment->status) }}</td></tr>
<tr><td style="padding:8px 0;font-size:13px;"><strong>Methode:</strong> {{ strtoupper($payment->payment_method) }}</td></tr>
</table>
<p style="margin:14px 0 0;font-size:12px;color:#6b7280;">Verifiez ce paiement dans l'espace admin.</p>
@endcomponent
