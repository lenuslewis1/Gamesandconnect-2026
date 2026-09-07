import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
    title: string;
    description: string;
    canonical?: string;
    ogImage?: string;
    ogType?: string;
    twitterCard?: 'summary' | 'summary_large_image';
    noindex?: boolean;
    children?: React.ReactNode;
    exactTitle?: boolean;
}

const SITE_NAME = 'Games and Connect';
const SITE_URL = 'https://gamesandconnect.com';
const DEFAULT_OG_IMAGE = 'https://res.cloudinary.com/drkjnrvtu/image/upload/c_fill,w_1200,h_630,g_auto/v1746915398/_MG_2403_hknyss.jpg';

const SEOHead = ({
    title,
    description,
    canonical,
    ogImage = DEFAULT_OG_IMAGE,
    ogType = 'website',
    twitterCard = 'summary_large_image',
    noindex = false,
    children,
    exactTitle = false,
}: SEOHeadProps) => {
    const fullTitle = exactTitle ? title : `${title} | ${SITE_NAME}`;
    const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : undefined;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {noindex && <meta name="robots" content="noindex, nofollow" />}
            {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content={ogType} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:site_name" content={SITE_NAME} />
            {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

            {/* Twitter Card */}
            <meta name="twitter:card" content={twitterCard} />
            <meta name="twitter:site" content="@GamesConnect_gh" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />

            {children}
        </Helmet>
    );
};

export default SEOHead;
