import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
}

const PageHeader = ({ title, subtitle, className, children }: PageHeaderProps) => {
  const { pathname } = useLocation();
  const images: Record<string,string> = { '/events':'hero-game-day.jpg', '/game-day':'game-day.jpg', '/travel':'savannah/JTN_6397.webp', '/community':'savannah/JTN_6780.webp', '/gallery':'savannah/JTN_6606.webp', '/teams':'community-team.jpg', '/trivia':'community-play.jpg', '/blog':'savannah-experience.jpg', '/contact':'community-portrait.jpg' };
  return (
    <section className={cn("gc-page-hero", className)}>
      <img className="gc-page-photo" src={'/assets/games-connect/' + (images[pathname] || 'community.jpg')} alt="Games and Connect experiences in Ghana" />
      <div className="gc-page-shade" />
      <div className="container gc-page-copy">
        <span className="gc-page-kicker">GAMES & CONNECT · GHANA</span>
        <h1>{title}</h1>
        {subtitle && (
          <p className="mt-6 max-w-2xl text-lg">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
};

export default PageHeader;
