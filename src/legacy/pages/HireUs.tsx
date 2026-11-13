import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';
import SEOHead from '@/components/seo/SEOHead';
import HireNavigation from '@/components/HireNavigation';
import '../../corporate.css';

export default function HireUs() {
  return <Layout>
    <SEOHead title="Hire Us for Games and Events in Ghana" description="Hire Games & Connect for corporate team bonding, birthday games and group celebrations. Explore corporate events and games packages." canonical="/hire-us" />
    <PageHeader title="Your people. Our kind of play." subtitle="Bring Games & Connect to your next celebration, team day or gathering." />
    <HireNavigation />
    <section className="hire-options bond-wrap" aria-label="Hire us options">
      <Link to="/hire-us/corporate" className="hire-option">
        <img src="/assets/games-connect/friends-bonding.jpg" alt="Friends spending time together outdoors" />
        <div><h2>Corporate</h2><p>Team bonding, staff celebrations and retreats shaped around your people.</p><span>Plan a team day ↗</span></div>
      </Link>
      <Link to="/hire-us/packages" className="hire-option">
        <img src="/assets/games-connect/game-day.jpg" alt="Games and Connect game day" />
        <div><h2>Packages</h2><p>Compare games, group sizes and prices for birthdays and events of all sizes.</p><span>Explore packages ↗</span></div>
      </Link>
    </section>
  </Layout>;
}
