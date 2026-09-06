<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SafebRegistrationReceived extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public array $payload)
    {
    }

    public function envelope(): Envelope
    {
        $labels = [
            'panel' => 'Participant au panel',
            'partner' => 'Partenaire',
            'stand' => 'Reservation de stand',
            'masterclass' => 'Inscription masterclass',
            'pitch' => 'Concours de pitch',
            'culinary' => "Concours d'art culinaire",
        ];

        $typeLabel = $labels[$this->payload['type']] ?? $this->payload['type'] ?? 'Inscription';

        return new Envelope(subject: '[SAFEB 2026] Nouvelle inscription - ' . $typeLabel);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.safeb-registration',
            with: [
                'payload' => $this->payload,
            ]
        );
    }
}
