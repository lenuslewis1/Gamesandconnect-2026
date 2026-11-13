import { useRef, useState } from 'react';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';
import SEOHead from '@/components/seo/SEOHead';
import PackageEnquiryDialog from '@/components/PackageEnquiryDialog';
import HireNavigation from '@/components/HireNavigation';
import '../../corporate.css';

const packages = [
  { name: 'Little Legends', type: 'Kids’ birthdays', size: '10–30 kids', price: 'GH₵ 3,500', items: ['Archery', 'Soccer table', 'Electronic basketball', 'Word search', 'Limbo', 'XO', 'Cornhole toss', '1 free game', 'Service charge'] },
  { name: 'Social Play', type: 'Small group celebrations', size: '15–40 people', price: 'GH₵ 6,000', items: ['Soccer table', 'Electronic basketball', 'Soft archery', 'Giant Jenga', 'Table tennis', 'Giant XO', 'Giant four in a row', 'Board games', '1 free game', 'Service charge'] },
  { name: 'Team Rally', type: 'Corporate team days', size: '50–200 people', price: 'GH₵ 10,000', highlight: '3 levels of team bonding (9 games)', items: ['Soccer table', 'Electronic basketball', 'Table tennis', 'Giant Jenga', 'Beer pong tables', 'Giant XO', 'Giant four in a row', 'Darts', 'Mini golf', 'Board games', '1 free game', 'Service charge'] },
  { name: 'Play Festival', type: 'Large group fun days', size: '200–300 people', price: 'GH₵ 14,000', highlight: '4 levels of team bonding (12 games)', items: ['Snooker', 'Electronic basketball', 'Soft archery', 'Soccer table', 'Giant Jenga', 'Mini golf mats', 'Darts', 'Table tennis', 'Giant XO', 'Mini painting', 'Beer pong tables', 'Giant four in a row', 'Board games', '2 free games', 'Service charge'] },
];

export default function Packages() {
  const [selectedPackage, setSelectedPackage] = useState('');
  const opener = useRef<HTMLButtonElement | null>(null);

  function openEnquiry(event: React.MouseEvent<HTMLButtonElement>, packageName: string) {
    opener.current = event.currentTarget;
    setSelectedPackage(packageName);
  }

  return <Layout>
    <SEOHead title="Games Packages in Ghana" description="Choose a Games & Connect package for kids’ birthdays, celebrations, corporate team days and large group events." canonical="/hire-us/packages" />
    <PageHeader title="A package for your kind of play." subtitle="Explore our games, find your group size and choose the experience for your next event." />
    <HireNavigation />
    <section className="bond-packages bond-wrap" aria-labelledby="packages-title">
      <div className="bond-packages-heading">
        <h2 id="packages-title">Find your games package</h2>
        <p>Compare group sizes and prices, then choose a package to get in touch.</p>
      </div>
      <div className="bond-package-list">
        {packages.map(pkg => (
          <article className="bond-package" key={pkg.name}>
            <div className="bond-package-info">
              <p className="bond-package-type">{pkg.type}</p>
              <h3>{pkg.name}</h3>
              <p className="bond-package-size">{pkg.size}</p>
              {pkg.highlight && <p className="bond-package-highlight">{pkg.highlight}</p>}
              <ul className="bond-package-activities">{pkg.items.map(item => <li key={item}>{item}</li>)}</ul>
            </div>
            <div className="bond-package-booking">
              <p className="bond-package-price"><span>GH₵</span>{pkg.price.replace('GH₵ ', '')}</p>
              <button
                className="bond-button bond-package-button"
                onClick={event => openEnquiry(event, `${pkg.name} — ${pkg.price}`)}
                aria-label={`Choose ${pkg.name} package`}
                aria-haspopup="dialog"
              >
                Choose package <span aria-hidden="true">↗</span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
    {selectedPackage && (
      <PackageEnquiryDialog
        packageLabel={selectedPackage}
        onClose={() => setSelectedPackage('')}
        restoreFocus={() => opener.current?.focus()}
      />
    )}
  </Layout>;
}
