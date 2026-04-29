<?php

namespace App\Mail;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentStatusUpdated extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Payment $payment,
        public string $statusLabel,
        public ?string $customMessage = null,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Mise a jour de votre paiement LE RURAL',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.payment-status-updated',
            with: [
                'payment' => $this->payment,
                'statusLabel' => $this->statusLabel,
                'customMessage' => $this->customMessage,
            ],
        );
    }
}
