<?php

namespace Tests\Unit;

use App\Services\AnnouncementLinkResolver;
use Tests\TestCase;

class AnnouncementLinkResolverTest extends TestCase
{
    public function test_it_keeps_safe_external_and_internal_links(): void
    {
        $resolver = app(AnnouncementLinkResolver::class);

        $this->assertSame('https://lerural.bj/article/123', $resolver->normalize('https://lerural.bj/article/123'));
        $this->assertSame('/contact', $resolver->normalize('/contact'));
        $this->assertSame('#promo', $resolver->normalize('promo'));
    }

    public function test_it_maps_known_aliases_to_real_targets(): void
    {
        $resolver = app(AnnouncementLinkResolver::class);

        $this->assertSame('/#actualites', $resolver->normalize('/actualites'));
        $this->assertSame('/#abonnement', $resolver->normalize('subscription-plans'));
        $this->assertSame(route('press-papers.index'), $resolver->normalize('presse-ecrite'));
    }

    public function test_it_rejects_dangerous_protocols(): void
    {
        $resolver = app(AnnouncementLinkResolver::class);

        $this->assertNull($resolver->normalize('javascript:alert(1)'));
        $this->assertNull($resolver->normalize('data:text/html;base64,abc'));
    }
}