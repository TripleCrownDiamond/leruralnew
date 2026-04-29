<?php

namespace App\Mail;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PurchaseCreatedAlert extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Payment $payment)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Nouvel achat sur LE RURAL - Paiement #' . $this->payment->id);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.purchase-created-alert',
            with: ['payment' => $this->payment],
        );
    }
}
