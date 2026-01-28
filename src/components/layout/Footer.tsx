import { Link } from "react-router-dom";
import { Instagram, Twitter, Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-card">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="h-3 w-3 rounded-full bg-team-red" />
                <div className="h-3 w-3 rounded-full bg-team-yellow" />
                <div className="h-3 w-3 rounded-full bg-team-blue" />
                <div className="h-3 w-3 rounded-full bg-team-green" />
              </div>
              <span className="text-lg font-bold">Games & Connect</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Vibes • Games • Travel • Community
            </p>
            <p className="text-sm text-muted-foreground">
              Connecting young people through games, travel, and unforgettable experiences across Ghana.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/events" className="hover:text-primary transition-colors">
                  Upcoming Events
                </Link>
              </li>
              <li>
                <Link to="/game-day" className="hover:text-primary transition-colors">
                  Game Day
                </Link>
              </li>
              <li>
                <Link to="/trivia" className="hover:text-primary transition-colors">
                  Trivia Friday
                </Link>
              </li>
              <li>
                <Link to="/travel" className="hover:text-primary transition-colors">
                  Travel Experiences
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-primary transition-colors">
                  Gallery
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contact Us</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Accra, Ghana</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:hello@gamesandconnect.com" className="hover:text-primary transition-colors">
                  hello@gamesandconnect.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a href="tel:+233000000000" className="hover:text-primary transition-colors">
                  +233 00 000 0000
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h3 className="font-semibold">Follow Us</h3>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/gamesandconnect"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/gamesandconnect"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://wa.me/233000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="h-5 w-5" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              Join our WhatsApp community for updates!
            </p>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Games and Connect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
