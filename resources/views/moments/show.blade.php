<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{{ $pageTitle }}</title>
        <meta name="description" content="{{ $description }}">
        <link rel="canonical" href="{{ $shareUrl }}">

        <meta property="og:type" content="article">
        <meta property="og:site_name" content="{{ $business->business_name }}">
        <meta property="og:title" content="{{ $pageTitle }}">
        <meta property="og:description" content="{{ $description }}">
        <meta property="og:url" content="{{ $shareUrl }}">
        <meta property="og:image" content="{{ $imageUrl }}">
        <meta property="og:image:alt" content="{{ $moment->title }}">

        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $pageTitle }}">
        <meta name="twitter:description" content="{{ $description }}">
        <meta name="twitter:image" content="{{ $imageUrl }}">

        <script type="application/ld+json">
            {!! json_encode([
                '@context' => 'https://schema.org',
                '@type' => 'Review',
                'itemReviewed' => [
                    '@type' => 'Restaurant',
                    'name' => $business->business_name,
                ],
                'author' => [
                    '@type' => 'Person',
                    'name' => $moment->name,
                ],
                'reviewBody' => $moment->caption,
                'reviewRating' => [
                    '@type' => 'Rating',
                    'ratingValue' => (int) $moment->rating,
                    'bestRating' => 5,
                    'worstRating' => 1,
                ],
                'image' => [$imageUrl],
                'url' => $shareUrl,
            ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) !!}
        </script>

        <style>
            :root {
                color-scheme: dark;
            }
            * {
                box-sizing: border-box;
            }
            body {
                margin: 0;
                font-family: Figtree, ui-sans-serif, system-ui, sans-serif;
                background:
                    radial-gradient(circle at top left, rgba(245, 158, 11, 0.18), transparent 28%),
                    linear-gradient(180deg, #090909 0%, #141414 100%);
                color: #fff;
            }
            a {
                color: inherit;
                text-decoration: none;
            }
            .page {
                max-width: 1080px;
                margin: 0 auto;
                padding: 48px 24px 72px;
            }
            .shell {
                display: grid;
                gap: 28px;
            }
            .badge {
                display: inline-flex;
                gap: 10px;
                align-items: center;
                padding: 10px 16px;
                border-radius: 999px;
                border: 1px solid rgba(251, 191, 36, 0.3);
                background: rgba(251, 191, 36, 0.09);
                color: #fcd34d;
                font-size: 12px;
                font-weight: 700;
                letter-spacing: 0.18em;
                text-transform: uppercase;
            }
            .card {
                overflow: hidden;
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 32px;
                background: rgba(17, 17, 17, 0.92);
                box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
            }
            .hero {
                display: grid;
                gap: 0;
            }
            .hero img {
                width: 100%;
                height: 420px;
                object-fit: cover;
                display: block;
            }
            .content {
                padding: 28px;
            }
            .meta {
                display: flex;
                flex-wrap: wrap;
                gap: 14px;
                margin-top: 18px;
                color: #d4d4d4;
                font-size: 14px;
            }
            .stats {
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 14px;
                margin-top: 22px;
            }
            .stat {
                border-radius: 22px;
                border: 1px solid rgba(255, 255, 255, 0.08);
                background: rgba(255, 255, 255, 0.04);
                padding: 18px;
            }
            .stat strong {
                display: block;
                font-size: 28px;
                font-weight: 800;
            }
            .stat span {
                display: block;
                margin-top: 6px;
                font-size: 11px;
                letter-spacing: 0.14em;
                text-transform: uppercase;
                color: #a3a3a3;
            }
            .actions {
                display: flex;
                flex-wrap: wrap;
                gap: 14px;
                margin-top: 28px;
            }
            .button {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-height: 56px;
                padding: 0 22px;
                border-radius: 18px;
                font-weight: 800;
                transition: transform 0.2s ease, opacity 0.2s ease;
            }
            .button:hover {
                transform: translateY(-1px);
                opacity: 0.96;
            }
            .button-primary {
                background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
                color: #111;
            }
            .button-secondary {
                border: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(255, 255, 255, 0.05);
                color: #fff;
            }
            .comments {
                margin-top: 24px;
                display: grid;
                gap: 12px;
            }
            .comment {
                border-radius: 20px;
                background: rgba(255, 255, 255, 0.04);
                border: 1px solid rgba(255, 255, 255, 0.06);
                padding: 16px 18px;
            }
            .comment strong {
                display: block;
                margin-bottom: 6px;
            }
            @media (min-width: 880px) {
                .hero {
                    grid-template-columns: 1.15fr 0.85fr;
                }
                .hero img {
                    height: 100%;
                    min-height: 560px;
                }
            }
            @media (max-width: 640px) {
                .page {
                    padding: 28px 16px 48px;
                }
                .stats {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    </head>
    <body>
        <main class="page">
            <div class="shell">
                <span class="badge">Momento compartido</span>

                <article class="card hero">
                    <img src="{{ $imageUrl }}" alt="{{ $moment->title }}">

                    <div class="content">
                        <p style="margin: 0; color: #fcd34d; font-size: 12px; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase;">
                            {{ $moment->tag }}
                        </p>
                        <h1 style="margin: 14px 0 0; font-size: clamp(2rem, 4vw, 3.6rem); line-height: 1.02; font-weight: 900;">
                            {{ $moment->title }}
                        </h1>
                        <p style="margin: 14px 0 0; font-size: 18px; line-height: 1.8; color: #e5e5e5;">
                            {{ $moment->caption }}
                        </p>

                        <div class="meta">
                            <span>👤 {{ $moment->name }}</span>
                            <span>⭐ {{ number_format((float) $moment->rating, 1) }}/5</span>
                            <span>❤️ {{ $moment->likes_count }} me gusta</span>
                            <span>💬 {{ $moment->comments_count }} comentarios</span>
                        </div>

                        <div class="stats">
                            <div class="stat">
                                <strong>{{ number_format((float) $moment->rating, 1) }}</strong>
                                <span>Calificacion</span>
                            </div>
                            <div class="stat">
                                <strong>{{ $moment->likes_count }}</strong>
                                <span>Likes</span>
                            </div>
                            <div class="stat">
                                <strong>{{ $moment->comments_count }}</strong>
                                <span>Comentarios</span>
                            </div>
                        </div>

                        <div class="actions">
                            <a href="{{ route('landing') }}" class="button button-primary">Ver la landing</a>
                            <a href="{{ route('menu.index') }}" class="button button-secondary">Abrir menu</a>
                        </div>
                    </div>
                </article>

                @if ($moment->comments->isNotEmpty())
                    <section class="card" style="padding: 24px 24px 28px;">
                        <h2 style="margin: 0; font-size: 24px; font-weight: 900;">Comentarios recientes</h2>
                        <div class="comments">
                            @foreach ($moment->comments as $comment)
                                <div class="comment">
                                    <strong>{{ $comment->name }}</strong>
                                    <p style="margin: 0; color: #d4d4d4; line-height: 1.7;">{{ $comment->comment }}</p>
                                </div>
                            @endforeach
                        </div>
                    </section>
                @endif
            </div>
        </main>
    </body>
    </html>
