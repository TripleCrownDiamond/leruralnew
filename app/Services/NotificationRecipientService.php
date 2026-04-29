<?php

namespace App\Services;

use App\Models\Setting;
use App\Models\User;

class NotificationRecipientService
{
    /**
     * @return array<int, string>
     */
    public function adminAndFooterEmails(): array
    {
        $adminEmails = User::query()
            ->where('role', User::ROLE_ADMIN)
            ->pluck('email')
            ->filter()
            ->map(fn ($email) => trim((string) $email))
            ->filter()
            ->all();

        $footerEmail = trim((string) (Setting::where('key', 'contact_email')->value('value') ?? ''));

        return collect(array_merge($adminEmails, $footerEmail !== '' ? [$footerEmail] : []))
            ->map(fn ($email) => strtolower($email))
            ->unique()
            ->values()
            ->all();
    }
}
