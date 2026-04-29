@component('emails.layouts.base', ['headline' => 'Votre facture est disponible', 'eyebrow' => 'LE RURAL / Facturation'])
<p style="margin:0 0 14px;font-size:14px;line-height:1.6;">Merci pour votre achat. Votre facture est jointe a ce mail.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
<tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:13px;"><strong>Reference:</strong> {{ $reference }}</td></tr>
<tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:13px;"><strong>Montant:</strong> {{ number_format((float) $payment->amount, 0, ',', ' ') }} {{ $payment->currency }}</td></tr>
<tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:13px;"><strong>Type:</strong> {{ $payment->type }}</td></tr>
<tr><td style="padding:8px 0;font-size:13px;"><strong>Objet:</strong> {{ $itemName ?: 'Achat LE RURAL' }}</td></tr>
</table>
<p style="margin:14px 0 0;font-size:12px;color:#6b7280;">Conservez ce mail pour votre comptabilite.</p>
@endcomponent
