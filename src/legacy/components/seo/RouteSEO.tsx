import { useLocation } from 'react-router-dom';
import SEOHead from './SEOHead';

// Covers routes without a public page head, including the loading state.
export default function RouteSEO() {
    const { pathname } = useLocation();
    if (/^\/(admin|auth)(\/|$)/.test(pathname)) {
        return <SEOHead title="Account" description="Games and Connect account access." noindex />;
    }
    return null;
}
