<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SafebRegistrationConfirmed extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public array $payload)
    {
    }

    public function envelope(): Envelope
    {
        $typeLabel = $this->payload['type_label'] ?? 'Inscription';

        return new Envelope(subject: '[SAFEB 2026] Inscription confirmee - ' . $typeLabel);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.safeb-registration-confirmed',
            with: [
                'payload' => $this->payload,
            ]
        );
    }
}
