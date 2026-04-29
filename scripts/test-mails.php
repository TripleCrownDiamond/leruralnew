<?php
require __DIR__ . '/../vendor/autoload.php';

$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$admin = 'admin@lerural.bj';
$footer = (string) (App\Models\Setting::where('key', 'contact_email')->value('value') ?? '');
$user = App\Models\User::where('role', 'user')->first();
$payment = App\Models\Payment::latest()->first();
$sub = App\Models\UserSubscription::latest()->first();
$article = App\Models\Article::latest('id')->first();
$category = App\Models\Category::latest('id')->first();
$comment = App\Models\Comment::latest('id')->first();

if (!$user || !$payment || !$sub || !$article || !$category || !$comment) {
    fwrite(STDERR, "Missing fixtures for mail tests\n");
    exit(1);
}

$report = [];

$send = function (string $label, callable $callback) use (&$report) {
    try {
        $callback();
        $report[] = '[OK] ' . $label;
    } catch (Throwable $e) {
        $report[] = '[KO] ' . $label . ' => ' . $e->getMessage();
    }
};

$send('PurchaseCreatedAlert -> admin@lerural.bj', function () use ($admin, $payment) {
    Illuminate\Support\Facades\Mail::to($admin)->send(new App\Mail\PurchaseCreatedAlert($payment));
});

if ($footer !== '') {
    $send('PurchaseCreatedAlert -> ' . $footer, function () use ($footer, $payment) {
        Illuminate\Support\Facades\Mail::to($footer)->send(new App\Mail\PurchaseCreatedAlert($payment));
    });
}

$send('PaymentSubmittedAdmin -> admin@lerural.bj', function () use ($admin, $payment) {
    Illuminate\Support\Facades\Mail::to($admin)->send(new App\Mail\PaymentSubmittedAdmin($payment));
});

$send('PaymentStatusUpdated -> ' . $user->email, function () use ($user, $payment) {
    Illuminate\Support\Facades\Mail::to($user->email)->send(new App\Mail\PaymentStatusUpdated($payment, 'Valide', 'Test manuel de notification.'));
});

$send('PurchaseInvoice -> ' . $user->email, function () use ($user, $payment) {
    Illuminate\Support\Facades\Mail::to($user->email)->send(new App\Mail\PurchaseInvoice($payment));
});

$send('SubscriptionExpiringReminder -> ' . $user->email, function () use ($user, $sub) {
    Illuminate\Support\Facades\Mail::to($user->email)->send(new App\Mail\SubscriptionExpiringReminder($sub));
});

$send('SubscriptionExpiredNotice -> ' . $user->email, function () use ($user, $sub) {
    Illuminate\Support\Facades\Mail::to($user->email)->send(new App\Mail\SubscriptionExpiredNotice($sub));
});

$send('CategoryArticlePublished -> ' . $user->email, function () use ($user, $category, $article) {
    Illuminate\Support\Facades\Mail::to($user->email)->send(new App\Mail\CategoryArticlePublished($category, $article));
});

$send('CommentModerationStatus(approved) -> ' . $user->email, function () use ($user, $comment) {
    Illuminate\Support\Facades\Mail::to($user->email)->send(new App\Mail\CommentModerationStatus($comment, 'approved'));
});

$send('CommentModerationStatus(rejected) -> ' . $user->email, function () use ($user, $comment) {
    Illuminate\Support\Facades\Mail::to($user->email)->send(new App\Mail\CommentModerationStatus($comment, 'rejected'));
});

if (is_null($user->email_verified_at)) {
    $send('VerifyEmail -> ' . $user->email, function () use ($user) {
        $user->sendEmailVerificationNotification();
    });
}

$send('ResetPassword -> ' . $user->email, function () use ($user) {
    $token = Illuminate\Support\Facades\Password::broker()->createToken($user);
    $user->notify(new Illuminate\Auth\Notifications\ResetPassword($token));
});

foreach ($report as $line) {
    echo $line . PHP_EOL;
}
