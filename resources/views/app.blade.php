<!DOCTYPE html>
<html lang="es-CO">
    <head>
        @php
            $business = \App\Models\BusinessSetting::current();
            $siteName = $business->business_name ?: config('app.name', 'Laravel');
            $siteDescription = $business->hero_description ?: 'Menu digital, reservas y domicilios personalizables desde una sola instalacion.';
            $officialUrl = 'https://humococinaalbarril.com';
            $canonicalUrl = $officialUrl.'/'.ltrim(request()->path(), '/');
            $siteImage = $business->hero_image_path ? $officialUrl.'/storage/'.$business->hero_image_path : $officialUrl.'/images/humo_hero.png';
        @endphp
        <link rel="canonical" href="{{ $canonicalUrl }}" inertia="canonical">
        <meta property="og:url" content="{{ $canonicalUrl }}" inertia="og:url">
        @if(request()->routeIs('landing'))
            <script type="application/ld+json">{!! json_encode([
                '@context' => 'https://schema.org',
                '@type' => 'Restaurant',
                '@id' => $officialUrl.'/#restaurant',
                'name' => $siteName,
                'url' => $officialUrl.'/',
                'image' => $siteImage,
                'servesCuisine' => ['Asados', 'Carnes al barril', 'Parrilla'],
                'hasMenu' => $officialUrl.'/menu',
                'address' => ['@type' => 'PostalAddress', 'addressLocality' => 'Manizales', 'addressCountry' => 'CO'],
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) !!}</script>
        @endif
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="{{ $siteDescription }}">
        <meta name="robots" content="index,follow">
        <meta property="og:site_name" content="{{ $siteName }}">
        <meta property="og:locale" content="es_CO">
        <meta property="og:type" content="website">
        <meta property="og:title" content="{{ $siteName }}">
        <meta property="og:description" content="{{ $siteDescription }}">
        <meta property="og:image" content="{{ $siteImage }}">
        <meta name="twitter:card" content="summary_large_image">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body
        class="font-sans antialiased"
        style="
            --brand-navbar-bg: {{ $business->navbar_background_color ?: '#ffffff' }};
            --brand-navbar-text: {{ $business->navbar_text_color ?: '#111827' }};
            --brand-primary: {{ $business->primary_button_color ?: '#f59e0b' }};
            --brand-primary-text: {{ $business->primary_button_text_color ?: '#000000' }};
            --brand-section-bg: {{ $business->section_background_color ?: '#0a0a0a' }};
            --brand-surface-bg: {{ $business->section_surface_color ?: '#171717' }};
            --brand-cta-bg: {{ $business->cta_background_color ?: '#111111' }};
        "
    >
        @inertia
    </body>
</html>
