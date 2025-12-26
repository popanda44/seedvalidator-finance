import { Metadata } from 'next'

// ==========================================
// SEO Configuration for FinYeld AI
// ==========================================

const siteConfig = {
    name: 'FinYeld AI',
    description: 'AI-powered financial intelligence platform for startups. Real-time analytics, predictive forecasting, and investor-ready insights that maximize your yield.',
    url: 'https://potent-fin.vercel.app',
    ogImage: 'https://potent-fin.vercel.app/og-image.png',
    twitterHandle: '@finyeldai',
    keywords: [
        'fintech',
        'AI analytics',
        'startup finance',
        'cash flow management',
        'runway calculator',
        'financial intelligence',
        'predictive analytics',
        'burn rate tracker',
        'investor dashboard',
        'FP&A software',
        'financial forecasting',
        'startup CFO tools',
    ],
}

// Base metadata for all pages
export const baseMetadata: Metadata = {
    metadataBase: new URL(siteConfig.url),
    title: {
        default: `${siteConfig.name} | Intelligent Financial Analytics for Startups`,
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: siteConfig.url,
        title: siteConfig.name,
        description: siteConfig.description,
        siteName: siteConfig.name,
        images: [
            {
                url: siteConfig.ogImage,
                width: 1200,
                height: 630,
                alt: 'FinYeld AI - Financial Intelligence Platform',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: siteConfig.name,
        description: siteConfig.description,
        images: [siteConfig.ogImage],
        creator: siteConfig.twitterHandle,
    },
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon-16x16.png',
        apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
}

// Page-specific metadata generators
export function generatePageMetadata(
    title: string,
    description: string,
    path: string = ''
): Metadata {
    return {
        title,
        description,
        openGraph: {
            title: `${title} | ${siteConfig.name}`,
            description,
            url: `${siteConfig.url}${path}`,
        },
        twitter: {
            title: `${title} | ${siteConfig.name}`,
            description,
        },
        alternates: {
            canonical: `${siteConfig.url}${path}`,
        },
    }
}

// Structured data generators (JSON-LD)
export function generateOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'FinYeld AI',
        url: siteConfig.url,
        logo: `${siteConfig.url}/logo.png`,
        description: siteConfig.description,
        sameAs: [
            'https://twitter.com/finyeldai',
            'https://linkedin.com/company/finyeld-ai',
        ],
        contactPoint: {
            '@type': 'ContactPoint',
            email: 'hello@finyeld.ai',
            contactType: 'customer service',
        },
    }
}

export function generateSoftwareApplicationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'FinYeld AI',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web Browser',
        description: siteConfig.description,
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            description: 'Free trial available',
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '500',
            bestRating: '5',
            worstRating: '1',
        },
        featureList: [
            'Real-time financial analytics',
            'AI-powered forecasting',
            'Runway calculation',
            'Bank account integration',
            'Investor-ready reports',
            'Expense categorization',
            'Burn rate tracking',
        ],
    }
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    }
}

export function generateBreadcrumbSchema(
    items: { name: string; url: string }[]
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    }
}

// React component for injecting JSON-LD
export function JsonLd({ data }: { data: object }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    )
}

export { siteConfig }
