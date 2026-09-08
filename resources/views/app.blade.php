<?php
    $pageData = $page['props'] ?? [];
    $component = $page['component'] ?? '';
    $settings = is_array(data_get($pageData, 'settings')) ? data_get($pageData, 'settings') : [];
    $seo = is_array(data_get($pageData, 'seo')) ? data_get($pageData, 'seo') : [];
    $siteName = config('app.name', 'LE RURAL');
    $siteSlogan = data_get($seo, 'slogan') ?: data_get($settings, 'site_slogan') ?: '1er groupe de presse agricole en Afrique de l\'Ouest';
    $baseUrl = url('/');

    $resolveAbsoluteUrl = function (?string $value, ?string $fallback = null) use ($baseUrl): string {
        $candidate = trim((string) ($value ?: ''));
        $fallbackValue = $fallback ?: rtrim($baseUrl, '/') . '/logos/logo.png';

        if ($candidate === '') {
            return $fallbackValue;
        }

        if (preg_match('#^https?://#i', $candidate) || str_starts_with($candidate, '//')) {
            return str_starts_with($candidate, '//') ? 'https:' . $candidate : $candidate;
        }

        if (str_starts_with($candidate, '/')) {
            return url($candidate);
        }

        return url('/' . ltrim($candidate, '/'));
    };

    $defaultDescription = data_get($settings, 'seo_default_description') ?: 'LE RURAL - 1er groupe de presse agricole en Afrique de l\'Ouest. Actualités, analyses et informations sur l\'agriculture, l\'élevage et le monde rural.';
    // Image par défaut pour le partage social (recommandé: 1200x630px)
    // Priorité: settings > og-default.jpg > logo.png
    $defaultImagePath = '/images/og-default.jpg';
    if (!file_exists(public_path('images/og-default.jpg'))) {
        $defaultImagePath = '/logos/logo.png';
    }
    $defaultImage = $resolveAbsoluteUrl(data_get($settings, 'seo_default_image'), url($defaultImagePath));
    $defaultUrl = url()->current();
    $defaultLocale = str_replace('_', '-', app()->getLocale());

    // Pour la page d'accueil, ajouter le slogan au titre
    $isHomePage = $component === 'Welcome';
    $rawTitle = trim((string) (data_get($seo, 'title') ?: $siteName));
    $title = $isHomePage ? $siteName . ' - ' . $siteSlogan : $rawTitle;
    $description = trim((string) (data_get($seo, 'description') ?: $defaultDescription));
    $image = $resolveAbsoluteUrl(data_get($seo, 'image'), $defaultImage);
    $url = trim((string) (data_get($seo, 'url') ?: $defaultUrl));
    $type = trim((string) (data_get($seo, 'type') ?: 'website'));
    $locale = trim((string) (data_get($seo, 'locale') ?: $defaultLocale));
    $twitterCard = trim((string) (data_get($seo, 'twitter_card') ?: 'summary_large_image'));

    if ($component === 'Article/Show' && is_array(data_get($pageData, 'article'))) {
        $article = data_get($pageData, 'article');
        $articleTitle = trim((string) data_get($article, 'title'));
        $title = $articleTitle !== '' ? $articleTitle : $title;
        $description = trim((string) (data_get($article, 'share_description') ?: data_get($article, 'excerpt') ?: $description));
        $image = $resolveAbsoluteUrl(data_get($article, 'share_image') ?: data_get($article, 'image'), $defaultImage);
        $url = trim((string) (data_get($article, 'share_url') ?: $url));
        $type = 'article';
        $twitterCard = 'summary_large_image';
    } elseif ($component === 'Category/Show' && is_array(data_get($pageData, 'category'))) {
        $category = data_get($pageData, 'category');
        $categoryName = trim((string) data_get($category, 'name'));
        $title = $categoryName !== '' ? $categoryName : $title;
        $description = trim((string) (data_get($category, 'description') ?: $description));
        $image = $resolveAbsoluteUrl(data_get($category, 'image'), $defaultImage);
        $slug = data_get($category, 'slug');
        $url = is_string($slug) && $slug !== '' ? url('/categorie/' . ltrim($slug, '/')) : $url;
        $type = 'website';
        $twitterCard = 'summary_large_image';
    } elseif ($component === 'StaticPage' && is_array(data_get($pageData, 'page'))) {
        $pageItem = data_get($pageData, 'page');
        $pageTitle = trim((string) data_get($pageItem, 'title'));
        $title = $pageTitle !== '' ? $pageTitle : $title;
        $description = trim((string) (data_get($pageItem, 'meta_description') ?: strip_tags((string) data_get($pageItem, 'content', '')) ?: $description));
        $image = $resolveAbsoluteUrl(data_get($pageItem, 'hero_image_url'), $defaultImage);
        $slug = data_get($pageItem, 'slug');
        $url = is_string($slug) && $slug !== '' ? url('/pages/' . ltrim($slug, '/')) : $url;
        $type = 'website';
        $twitterCard = 'summary_large_image';
    }

    $imageAlt = $title;
?>
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ $title }}</title>
        <meta name="description" content="{{ $description }}">
        <meta property="og:type" content="{{ $type }}">
        <meta property="og:site_name" content="{{ $siteName }}">
        <meta property="og:title" content="{{ $title }}">
        <meta property="og:description" content="{{ $description }}">
        <meta property="og:image" content="{{ $image }}">
        <meta property="og:image:secure_url" content="{{ $image }}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:image:alt" content="{{ $imageAlt }}">
        <meta property="og:url" content="{{ $url }}">
        <meta property="og:locale" content="{{ $locale }}">
        <meta name="twitter:card" content="{{ $twitterCard }}">
        <meta name="twitter:title" content="{{ $title }}">
        <meta name="twitter:description" content="{{ $description }}">
        <meta name="twitter:image" content="{{ $image }}">
        <meta name="twitter:image:alt" content="{{ $imageAlt }}">
        <link rel="canonical" href="{{ $url }}">

        {{-- Donnees structurees. Elles doivent etre emises ici, cote serveur :
             le site ne fait pas de rendu serveur de React, un balisage pose
             dans un composant ne serait vu que des visiteurs, pas des robots. --}}
        @php
            $schema = $component === 'Article/Show' && is_array(data_get($pageData, 'article'))
                ? array_filter([
                    '@context' => 'https://schema.org',
                    '@type' => 'NewsArticle',
                    'headline' => $title,
                    'description' => $description,
                    'image' => [$image],
                    'datePublished' => data_get($pageData, 'article.published_at'),
                    'dateModified' => data_get($pageData, 'article.updated_at') ?: data_get($pageData, 'article.published_at'),
                    'author' => ['@type' => 'Person', 'name' => data_get($pageData, 'article.author') ?: $siteName],
                    'publisher' => [
                        '@type' => 'Organization',
                        'name' => $siteName,
                        'logo' => ['@type' => 'ImageObject', 'url' => url('/logos/logo.png')],
                    ],
                    'mainEntityOfPage' => ['@type' => 'WebPage', '@id' => $url],
                    'inLanguage' => $locale,
                ])
                : [
                    '@context' => 'https://schema.org',
                    '@type' => 'WebSite',
                    'name' => $siteName,
                    'url' => url('/'),
                    'inLanguage' => $locale,
                    'publisher' => [
                        '@type' => 'Organization',
                        'name' => $siteName,
                        'logo' => ['@type' => 'ImageObject', 'url' => url('/logos/logo.png')],
                    ],
                    'potentialAction' => [
                        '@type' => 'SearchAction',
                        'target' => url('/search') . '?q={search_term_string}',
                        'query-input' => 'required name=search_term_string',
                    ],
                ];
        @endphp
        <script type="application/ld+json">{!! json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}</script>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        {{-- Le logo horizontal servait de favicon : illisible une fois reduit a 32px.
             Ces icones carrees reprennent le monogramme R de la marque. --}}
        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
