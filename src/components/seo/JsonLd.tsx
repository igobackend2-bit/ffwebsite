import React from 'react';

/**
 * Reusable JSON-LD injectors.
 * All components render a single <script type="application/ld+json">.
 * They are intentionally server-rendered (no 'use client').
 */

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://farmersfactory.com';

const SITE_NAME = 'Farmers Factory';
const LOGO_URL = `${SITE_URL}/logo.png`;

function jsonLdScript(data: Record<string, any>) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Organization + brand entity for Google Knowledge Panel */
export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: LOGO_URL,
      width: 512,
      height: 512,
    },
    sameAs: [
      'https://www.facebook.com/farmersfactory',
      'https://www.instagram.com/farmersfactory',
      'https://twitter.com/farmersfactory',
      'https://www.youtube.com/@farmersfactory',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'support@farmersfactory.com',
        availableLanguage: ['English', 'Tamil', 'Hindi'],
      },
    ],
  };
  return jsonLdScript(data);
}

/** WebSite + SearchAction → enables Google's sitelinks search box */
export function WebSiteJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description:
      'Farm-direct organic fruits, vegetables and Valluvam products — 24-hour delivery from our farms to your doorstep.',
    inLanguage: 'en',
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
  return jsonLdScript(data);
}

/** Breadcrumb trail */
export function BreadcrumbJsonLd({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url.startsWith('http') ? it.url : `${SITE_URL}${it.url}`,
    })),
  };
  return jsonLdScript(data);
}

/** Product schema for /products/[id] */
export function ProductJsonLd({
  id,
  name,
  description,
  image,
  price,
  currency = 'INR',
  availability = 'https://schema.org/InStock',
  brand = SITE_NAME,
  sku,
  ratingValue,
  reviewCount,
}: {
  id: string;
  name: string;
  description?: string;
  image?: string | string[];
  price?: number | string;
  currency?: string;
  availability?: string;
  brand?: string;
  sku?: string;
  ratingValue?: number;
  reviewCount?: number;
}) {
  const data: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${SITE_URL}/products/${id}#product`,
    name,
    description: description || `${name} - fresh, farm-direct, organic produce from ${SITE_NAME}.`,
    image: image || `${SITE_URL}/placeholder_product.png`,
    sku: sku || id,
    brand: { '@type': 'Brand', name: brand },
    url: `${SITE_URL}/products/${id}`,
  };

  if (price !== undefined && price !== null) {
    data.offers = {
      '@type': 'Offer',
      url: `${SITE_URL}/products/${id}`,
      priceCurrency: currency,
      price: String(price),
      availability,
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': `${SITE_URL}/#organization` },
    };
  }

  if (ratingValue && reviewCount) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue,
      reviewCount,
    };
  }

  return jsonLdScript(data);
}

/** LocalBusiness — optional, useful if/when address is finalized */
export function LocalBusinessJsonLd({
  streetAddress,
  addressLocality,
  addressRegion,
  postalCode,
  addressCountry = 'IN',
  telephone,
}: {
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry?: string;
  telephone?: string;
} = {}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#localbusiness`,
    name: SITE_NAME,
    image: LOGO_URL,
    url: SITE_URL,
    telephone: telephone || '+91-00000-00000',
    priceRange: '₹₹',
    address: {
      '@type': 'PostalAddress',
      streetAddress: streetAddress || '',
      addressLocality: addressLocality || '',
      addressRegion: addressRegion || '',
      postalCode: postalCode || '',
      addressCountry,
    },
  };
  return jsonLdScript(data);
}
