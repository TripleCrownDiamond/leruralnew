<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Facture {{ $reference }}</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: DejaVu Sans, sans-serif;
            color: #1f2937;
            margin: 0;
            padding: 40px;
            font-size: 12px;
            line-height: 1.5;
        }
        .brand-rail {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 10px;
            letter-spacing: 4px;
            text-transform: uppercase;
            color: #2f6a11;
            font-weight: 900;
            margin-bottom: 20px;
        }
        .brand-rail .dot { width: 6px; height: 6px; background: #2f6a11; border-radius: 50%; display: inline-block; }
        header {
            border-bottom: 2px solid #2f6a11;
            padding-bottom: 20px;
            margin-bottom: 30px;
            width: 100%;
        }
        .header-table { width: 100%; border-collapse: collapse; }
        .header-table td { vertical-align: top; }
        .brand-logo { height: 54px; width: auto; margin-bottom: 8px; }
        h1 {
            font-size: 32px;
            font-weight: 900;
            letter-spacing: -0.5px;
            margin: 0;
            color: #111827;
        }
        .reference {
            text-align: right;
            font-size: 11px;
            color: #6b7280;
        }
        .reference strong {
            display: block;
            font-size: 16px;
            color: #2f6a11;
            font-weight: 900;
            letter-spacing: 1px;
            margin-top: 4px;
        }
        .parties {
            display: table;
            width: 100%;
            margin-bottom: 30px;
        }
        .parties > div {
            display: table-cell;
            width: 50%;
            vertical-align: top;
        }
        .eyebrow {
            font-size: 9px;
            letter-spacing: 3px;
            text-transform: uppercase;
            font-weight: 900;
            color: #6b7280;
            margin-bottom: 6px;
        }
        .party-name {
            font-size: 14px;
            font-weight: 900;
            color: #111827;
            text-transform: uppercase;
        }
        table.items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        table.items thead th {
            text-align: left;
            background: #f9fafb;
            border-top: 1px solid #e5e7eb;
            border-bottom: 1px solid #e5e7eb;
            padding: 12px 14px;
            font-size: 10px;
            letter-spacing: 2px;
            text-transform: uppercase;
            font-weight: 900;
            color: #6b7280;
        }
        table.items tbody td {
            padding: 16px 14px;
            border-bottom: 1px solid #f3f4f6;
        }
        table.items tbody td.amount {
            text-align: right;
            font-weight: 900;
            color: #2f6a11;
            font-size: 14px;
        }
        .totals {
            width: 260px;
            margin-left: auto;
            margin-top: 16px;
        }
        .totals .row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
        }
        .totals .row.grand {
            border-top: 2px solid #111827;
            margin-top: 8px;
            padding-top: 12px;
            font-size: 15px;
        }
        .totals .row.grand strong { color: #2f6a11; }
        .status-pill {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 999px;
            font-size: 10px;
            letter-spacing: 1px;
            text-transform: uppercase;
            font-weight: 900;
            background: #dcfce7;
            color: #166534;
            border: 1px solid #86efac;
        }
        footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 10px;
            color: #9ca3af;
            letter-spacing: 1px;
        }
    </style>
</head>
<body>
    <div class="brand-rail">
        <span class="dot"></span>
        <span>LE RURAL</span>
        <span style="color:#d1d5db">/</span>
        <span>Facture</span>
    </div>

    <header>
        <table class="header-table">
            <tr>
                <td>
                    <img src="{{ public_path('logos/logo.png') }}" alt="LE RURAL" class="brand-logo">
                    <h1>FACTURE</h1>
                    <p style="margin: 4px 0 0 0; color: #6b7280;">Premier groupe de presse agricole en Afrique de l'Ouest</p>
                </td>
                <td class="reference">
                    <div class="eyebrow">Reference</div>
                    <strong>{{ $reference }}</strong>
                    <div style="margin-top: 10px;">Date d'emission<br><strong style="color:#111827; font-size: 12px;">{{ $payment->created_at->format('d/m/Y') }}</strong></div>
                </td>
            </tr>
        </table>
    </header>

    <div class="parties">
        <div>
            <div class="eyebrow">Emetteur</div>
            <div class="party-name">LE RURAL</div>
            <div style="margin-top: 4px; color: #4b5563;">
                Premier groupe de presse agricole en Afrique de l'Ouest<br>
                Cotonou - Benin<br>
                contact@lerural.info
            </div>
        </div>
        <div>
            <div class="eyebrow">Facture a</div>
            <div class="party-name">{{ $payment->user->name ?? 'Client' }}</div>
            <div style="margin-top: 4px; color: #4b5563;">
                {{ $payment->user->email ?? '-' }}<br>
                Client #{{ str_pad((string) $payment->user_id, 5, '0', STR_PAD_LEFT) }}
            </div>
        </div>
    </div>

    <table class="items">
        <thead>
            <tr>
                <th style="width: 60%;">Description</th>
                <th>Type</th>
                <th style="text-align: right;">Montant</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <strong style="display:block; color:#111827; font-size: 13px;">{{ $itemName ?? $payment->description ?? 'Achat LE RURAL' }}</strong>
                    @if($payment->description && $itemName && $payment->description !== $itemName)
                        <span style="color: #6b7280; font-size: 11px;">{{ $payment->description }}</span>
                    @endif
                </td>
                <td style="color: #4b5563;">{{ $typeLabel }}</td>
                <td class="amount">{{ number_format($payment->amount, 0, ',', ' ') }} {{ $payment->currency }}</td>
            </tr>
        </tbody>
    </table>

    <div class="totals">
        <div class="row">
            <span style="color:#6b7280;">Sous-total</span>
            <span>{{ number_format($payment->amount, 0, ',', ' ') }} {{ $payment->currency }}</span>
        </div>
        <div class="row">
            <span style="color:#6b7280;">Taxes</span>
            <span>Incluses</span>
        </div>
        <div class="row grand">
            <strong>Total paye</strong>
            <strong>{{ number_format($payment->amount, 0, ',', ' ') }} {{ $payment->currency }}</strong>
        </div>
    </div>

    <div style="margin-top: 40px;">
        <div class="eyebrow">Informations de paiement</div>
        <table style="width: 100%; margin-top: 8px; border-collapse: collapse;">
            <tr>
                <td style="padding: 6px 0; color: #6b7280; width: 30%;">Moyen de paiement</td>
                <td style="padding: 6px 0; font-weight: bold; color: #111827; text-transform: capitalize;">{{ $payment->payment_method }}</td>
            </tr>
            @if($payment->transaction_id)
            <tr>
                <td style="padding: 6px 0; color: #6b7280;">ID transaction</td>
                <td style="padding: 6px 0; font-weight: bold; color: #111827; font-family: monospace;">{{ $payment->transaction_id }}</td>
            </tr>
            @endif
            <tr>
                <td style="padding: 6px 0; color: #6b7280;">Date de paiement</td>
                <td style="padding: 6px 0; font-weight: bold; color: #111827;">{{ optional($payment->paid_at ?? $payment->created_at)->format('d/m/Y H:i') }}</td>
            </tr>
            <tr>
                <td style="padding: 6px 0; color: #6b7280;">Statut</td>
                <td style="padding: 6px 0;"><span class="status-pill">Paye</span></td>
            </tr>
        </table>
    </div>

    <footer>
        Merci pour votre confiance - LE RURAL, premier groupe de presse agricole en Afrique de l'Ouest<br>
        Cette facture est generee automatiquement et ne necessite pas de signature.
    </footer>
</body>
</html>
