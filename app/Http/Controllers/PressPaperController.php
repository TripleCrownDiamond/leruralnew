<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\PressPaper;
use App\Models\UserSubscription;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PressPaperController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $subscriptionCoversPress = $this->hasSubscriptionScope($user?->id, 'access_press_ecrite');

        $purchasedPaperIds = collect();
        if ($user) {
            $purchasedPaperIds = Payment::query()
                ->where('user_id', $user->id)
                ->where('type', 'paper')
                ->where('status', 'completed')
                ->pluck('related_id');
        }

        return Inertia::render('PressPapers/Index', [
            'pressPapers' => PressPaper::query()
                ->published()
                ->orderByDesc('published_at')
                ->orderByDesc('id')
                ->get()
                ->map(function (PressPaper $paper) use ($subscriptionCoversPress, $purchasedPaperIds) {
                    $coverUrl = $this->toPublicUrl($paper->cover_image);
                    $pdfUrl = $this->toPublicUrl($paper->pdf_file);
                    $hasAccess = $subscriptionCoversPress || $purchasedPaperIds->contains($paper->id);
                    $isFree = (float) $paper->price <= 0;

                    return [
                        'id' => $paper->id,
                        'title' => $paper->title,
                        'slug' => $paper->slug,
                        'description' => $paper->description,
                        'cover_url' => $coverUrl,
                        'pdf_url' => $pdfUrl,
                        'price' => (float) $paper->price,
                        'price_label' => $isFree ? 'Gratuit' : number_format((float) $paper->price, 0, ',', ' ') . ' FCFA',
                        'published_human' => optional($paper->published_at)->diffForHumans(),
                        'can_download' => $hasAccess || $isFree,
                        'download_url' => $hasAccess ? route('press-papers.download', $paper->slug) : ($isFree ? $pdfUrl : route('payment.checkout', ['type' => 'paper', 'id' => $paper->slug])),
                        'action_url' => $hasAccess ? route('press-papers.download', $paper->slug) : ($isFree ? $pdfUrl : route('payment.checkout', ['type' => 'paper', 'id' => $paper->slug])),
                        'action_label' => $hasAccess || $isFree ? 'Telecharger' : 'Acheter',
                        'cover_label' => 'Premiere page',
                    ];
                })
                ->values(),
        ]);
    }

    public function download(Request $request, PressPaper $pressPaper): RedirectResponse
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        $hasScopeAccess = $this->hasSubscriptionScope($user->id, 'access_press_ecrite');
        $hasPurchased = Payment::query()
            ->where('user_id', $user->id)
            ->where('type', 'paper')
            ->where('status', 'completed')
            ->where('related_id', $pressPaper->id)
            ->exists();

        if (!$hasScopeAccess && !$hasPurchased) {
            return back()->with('error', 'Acces reserve aux achats verifies ou aux abonnements avec acces journaux.');
        }

        return redirect()->away($this->toPublicUrl($pressPaper->pdf_file) ?? '#');
    }

    private function toPublicUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        $normalized = preg_replace('#^/?storage/#', '', $path) ?? $path;
        $normalized = ltrim((string) preg_replace('#^public/#', '', $normalized), '/');

        if ($normalized === '') {
            return null;
        }

        return Storage::disk('public')->url($normalized);
    }

    private function hasSubscriptionScope(?int $userId, string $scope): bool
    {
        if (!$userId) {
            return false;
        }

        $activeSubscriptions = UserSubscription::query()
            ->where('user_id', $userId)
            ->where('status', 'active')
            ->where('ends_at', '>', now())
            ->with('plan:id,features')
            ->get();

        foreach ($activeSubscriptions as $subscription) {
            $features = collect($subscription->plan?->features ?? [])
                ->map(fn ($feature) => (string) $feature)
                ->filter();

            if ($features->isEmpty()) {
                return true;
            }

            if ($features->contains($scope)) {
                return true;
            }
        }

        return false;
    }
}
