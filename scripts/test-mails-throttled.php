<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::where('role', 'user')->firstOrFail();
$sub = App\Models\UserSubscription::latest()->firstOrFail();
$article = App\Models\Article::latest('id')->firstOrFail();
$category = App\Models\Category::latest('id')->firstOrFail();
$comment = App\Models\Comment::latest('id')->firstOrFail();

$tests = [
    'SubscriptionExpiringReminder' => fn() => Illuminate\Support\Facades\Mail::to($user->email)->send(new App\Mail\SubscriptionExpiringReminder($sub)),
    'SubscriptionExpiredNotice' => fn() => Illuminate\Support\Facades\Mail::to($user->email)->send(new App\Mail\SubscriptionExpiredNotice($sub)),
    'CategoryArticlePublished' => fn() => Illuminate\Support\Facades\Mail::to($user->email)->send(new App\Mail\CategoryArticlePublished($category, $article)),
    'CommentModerationStatus approved' => fn() => Illuminate\Support\Facades\Mail::to($user->email)->send(new App\Mail\CommentModerationStatus($comment, 'approved')),
    'CommentModerationStatus rejected' => fn() => Illuminate\Support\Facades\Mail::to($user->email)->send(new App\Mail\CommentModerationStatus($comment, 'rejected')),
    'VerifyEmail notification' => fn() => $user->notify(new Illuminate\Auth\Notifications\VerifyEmail()),
];

foreach ($tests as $label => $callback) {
    try {
        $callback();
        echo "[OK] {$label}\n";
    } catch (Throwable $e) {
        echo "[KO] {$label} => {$e->getMessage()}\n";
    }

    sleep(3);
}
