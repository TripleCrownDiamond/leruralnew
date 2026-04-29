<?php

namespace App\Mail;

use App\Models\Payment;
use App\Models\Article;
use App\Models\PressPaper;
use App\Models\SubscriptionPlan;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class PurchaseInvoice extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Payment $payment)
    {
        $this->payment->loadMissing('user');
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Votre facture LE RURAL - Paiement #' . $this->payment->id);
    }

    public function content(): Content
    {
        $itemName = match ($this->payment->type) {
            'article' => optional(Article::find($this->payment->related_id))->title_fr,
            'subscription' => optional(SubscriptionPlan::find($this->payment->related_id))->name,
            'paper' => optional(PressPaper::find($this->payment->related_id))->title,
            default => null,
        };

        return new Content(
            view: 'emails.purchase-invoice',
            with: [
                'payment' => $this->payment,
                'itemName' => $itemName,
                'reference' => $this->payment->reference ?? ('INV-' . str_pad((string) $this->payment->id, 6, '0', STR_PAD_LEFT)),
            ],
        );
    }

    /**
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        try {
            $itemName = match ($this->payment->type) {
                'article' => optional(Article::find($this->payment->related_id))->title_fr,
                'subscription' => optional(SubscriptionPlan::find($this->payment->related_id))->name,
                'paper' => optional(PressPaper::find($this->payment->related_id))->title,
                default => null,
            };

            $reference = $this->payment->reference ?? ('INV-' . str_pad((string) $this->payment->id, 6, '0', STR_PAD_LEFT));

            $pdf = Pdf::loadView('invoices.payment', [
                'payment' => $this->payment,
                'itemName' => $itemName,
                'reference' => $reference,
                'typeLabel' => match ($this->payment->type) {
                    'article' => 'Article premium',
                    'subscription' => 'Abonnement',
                    'paper' => 'Journal papier',
                    default => 'Achat',
                },
            ])->output();

            return [
                Attachment::fromData(fn () => $pdf, 'facture-' . $reference . '.pdf')->withMime('application/pdf'),
            ];
        } catch (\Throwable $exception) {
            Log::warning('purchase_invoice.attachment_failed', [
                'payment_id' => $this->payment->id,
                'message' => $exception->getMessage(),
            ]);

            return [];
        }
    }
}
