import { Head, usePage } from '@inertiajs/react';

const defaultDescription = 'HUMO Cocina al Barril en Manizales: asados al barril, reservas, domicilios, menu digital y momentos reales compartidos por clientes.';
const defaultKeywords = 'HUMO Cocina al Barril, asados al barril Manizales, restaurante en Manizales, reservas restaurante Manizales, domicilios Manizales, carnes al barril';
export const SITE_URL = 'https://humococinaalbarril.com';
export function canonicalUrl(value = '/') {
    const parsed = new URL(value, SITE_URL);
    return `${SITE_URL}${parsed.pathname}${parsed.search}`;
}

const defaultImage = '/images/humo_hero.png';

export default function SeoHead({
    title,
    description = defaultDescription,
    canonical,
    image = defaultImage,
    type = 'website',
    keywords = defaultKeywords,
    robots = 'index,follow',
    jsonLd = null,
}) {
    const { business } = usePage().props;
    const businessName = business?.name || 'HUMO Cocina al Barril';
    const pageTitle = title ? `${title} | ${businessName}` : businessName;
    const resolvedCanonical = canonicalUrl(canonical || '/');
    const resolvedImage = new URL(image, SITE_URL).href;

    return (
        <Head title={pageTitle}>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta name="robots" content={robots} />
            <link head-key="canonical" rel="canonical" href={resolvedCanonical} />

            <meta property="og:locale" content="es_CO" />
            <meta property="og:type" content={type} />
            <meta property="og:site_name" content={businessName} />
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={description} />
            <meta head-key="og:url" property="og:url" content={resolvedCanonical} />
            <meta property="og:image" content={resolvedImage} />
            <meta property="og:image:alt" content={pageTitle} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={pageTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={resolvedImage} />

            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
                    }}
                />
            )}
        </Head>
    );
}
