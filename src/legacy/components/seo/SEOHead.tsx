import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

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
const DEFAULT_OG_IMAGE = 'https://gamesandconnect.com/og-image.png';

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
    const { pathname } = useLocation();
    const canonicalUrl = new URL(canonical || pathname, SITE_URL);
    canonicalUrl.search = '';
    canonicalUrl.hash = '';
    canonicalUrl.pathname = canonicalUrl.pathname.replace(/\/+$/, '') || '/';
    const imageUrl = new URL(ogImage, SITE_URL).href;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="robots" content={noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'} />
            <link rel="canonical" href={canonicalUrl.href} />

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content={ogType} />
            <meta property="og:image" content={imageUrl} />
            {ogImage === DEFAULT_OG_IMAGE && <meta property="og:image:width" content="1200" />}
            {ogImage === DEFAULT_OG_IMAGE && <meta property="og:image:height" content="630" />}
            <meta property="og:image:alt" content={fullTitle} />
            <meta property="og:locale" content="en_GH" />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:url" content={canonicalUrl.href} />

            {/* Twitter Card */}
            <meta name="twitter:card" content={twitterCard} />
            <meta name="twitter:site" content="@GamesConnect_gh" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={imageUrl} />
            <meta name="twitter:image:alt" content={fullTitle} />

            {children}
        </Helmet>
    );
};

export default SEOHead;
