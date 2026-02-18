import { Helmet } from 'react-helmet-async';

// ==========================================
// Organization Schema
// ==========================================
export const OrganizationSchema = () => {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Games and Connect',
        alternateName: 'Games & Connect Ghana',
        url: 'https://gamesandconnect.com',
        logo: 'https://gamesandconnect.com/logo.png',
        description:
            'Ghana\'s leading youth community for fun events, squad games, travel adventures, and team building experiences in Accra and across Ghana.',
        foundingDate: '2023',
        areaServed: {
            '@type': 'Country',
            name: 'Ghana',
        },
        address: {
            '@type': 'PostalAddress',
            addressLocality: 'East Legon',
            addressRegion: 'Greater Accra',
            addressCountry: 'GH',
        },
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+233505891665',
            contactType: 'customer service',
            email: 'hello@gamesandconnect.com',
            availableLanguage: 'English',
        },
        sameAs: [
            'https://www.instagram.com/games_connect_gh/',
            'https://x.com/GamesConnect_gh',
            'https://facebook.com/gamesandconnect',
            'https://www.tiktok.com/@games_and_connect',
        ],
    };

    return (
        <Helmet>
            <script type="application/ld+json">{JSON.stringify(schema)}</script>
        </Helmet>
    );
};

// ==========================================
// Local Business Schema
// ==========================================
export const LocalBusinessSchema = () => {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': 'https://gamesandconnect.com/#business',
        name: 'Games and Connect',
        image: 'https://gamesandconnect.com/logo.png',
        url: 'https://gamesandconnect.com',
        telephone: '+233505891665',
        email: 'hello@gamesandconnect.com',
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'East Legon',
            addressLocality: 'Accra',
            addressRegion: 'Greater Accra',
            addressCountry: 'GH',
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: 5.6406,
            longitude: -0.1526,
        },
        openingHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '08:00',
            closes: '17:00',
        },
        priceRange: 'GH₵50 - GH₵500',
    };

    return (
        <Helmet>
            <script type="application/ld+json">{JSON.stringify(schema)}</script>
        </Helmet>
    );
};

// ==========================================
// Event Schema
// ==========================================
interface EventSchemaProps {
    name: string;
    description: string;
    startDate: string;
    location: string;
    image?: string;
    price?: string;
    url?: string;
    timeRange?: string;
    capacity?: number;
}

export const EventSchema = ({
    name,
    description,
    startDate,
    location,
    image,
    price,
    url,
    timeRange,
    capacity,
}: EventSchemaProps) => {
    const priceNum = price ? parseFloat(price.replace(/[^0-9.]/g, '')) || 0 : 0;

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name,
        description,
        startDate,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: {
            '@type': 'Place',
            name: location,
            address: {
                '@type': 'PostalAddress',
                addressLocality: location.includes('Accra') ? 'Accra' : location,
                addressRegion: 'Greater Accra',
                addressCountry: 'GH',
            },
        },
        image: image || 'https://gamesandconnect.com/logo.png',
        organizer: {
            '@type': 'Organization',
            name: 'Games and Connect',
            url: 'https://gamesandconnect.com',
        },
        ...(priceNum > 0
            ? {
                offers: {
                    '@type': 'Offer',
                    price: priceNum,
                    priceCurrency: 'GHS',
                    availability: 'https://schema.org/InStock',
                    url: url || 'https://gamesandconnect.com/events',
                    validFrom: new Date().toISOString(),
                },
            }
            : {
                isAccessibleForFree: true,
            }),
        ...(capacity ? { maximumAttendeeCapacity: capacity } : {}),
        ...(timeRange
            ? { doorTime: timeRange.split(' - ')[0] || timeRange }
            : {}),
    };

    return (
        <Helmet>
            <script type="application/ld+json">{JSON.stringify(schema)}</script>
        </Helmet>
    );
};

// ==========================================
// FAQ Schema
// ==========================================
interface FAQItem {
    question: string;
    answer: string;
}

interface FAQSchemaProps {
    faqs: FAQItem[];
}

export const FAQSchema = ({ faqs }: FAQSchemaProps) => {
    const schema = {
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
    };

    return (
        <Helmet>
            <script type="application/ld+json">{JSON.stringify(schema)}</script>
        </Helmet>
    );
};

// ==========================================
// Breadcrumb Schema
// ==========================================
interface BreadcrumbItem {
    name: string;
    url: string;
}

interface BreadcrumbSchemaProps {
    items: BreadcrumbItem[];
}

export const BreadcrumbSchema = ({ items }: BreadcrumbSchemaProps) => {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `https://gamesandconnect.com${item.url}`,
        })),
    };

    return (
        <Helmet>
            <script type="application/ld+json">{JSON.stringify(schema)}</script>
        </Helmet>
    );
};

// ==========================================
// Event Location Schema (reusable)
// ==========================================
interface EventLocationSchemaProps {
    name: string;
    locality?: string;
    region?: string;
}

export const EventLocationSchema = ({
    name,
    locality = 'Accra',
    region = 'Greater Accra',
}: EventLocationSchemaProps) => {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Place',
        name,
        address: {
            '@type': 'PostalAddress',
            addressLocality: locality,
            addressRegion: region,
            addressCountry: 'GH',
        },
    };

    return (
        <Helmet>
            <script type="application/ld+json">{JSON.stringify(schema)}</script>
        </Helmet>
    );
};
