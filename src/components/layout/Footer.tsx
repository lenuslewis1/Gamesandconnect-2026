import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
    return (
        <footer className="bg-black text-[#FFF7ED] pt-24 pb-12 border-t border-[#334155]">
            <div className="container">
                <div className="grid gap-16 md:grid-cols-2 lg:grid-cols-4 mb-20">
                    {/* Brand Column */}
                    <div className="space-y-8">
                        <Link to="/" className="inline-block hover:opacity-80 transition-opacity">
                            <img src="/logo.png" alt="Games & Connect" className="h-20 w-auto" />
                        </Link>
                        <p className="text-white/70 leading-relaxed font-light text-lg max-w-xs">
                            Curating spaces for genuine connection, adventure, and play in Ghana.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://www.instagram.com/games_connect_gh/" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-[#fd4c01] hover:text-white transition-all duration-300">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="https://x.com/GamesConnect_gh" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-[#fd4c01] hover:text-white transition-all duration-300">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="https://facebook.com/gamesandconnect" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-[#fd4c01] hover:text-white transition-all duration-300">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="https://www.tiktok.com/@games_and_connect" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-[#fd4c01] hover:text-white transition-all duration-300">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-serif text-2xl font-medium mb-8">Explore</h3>
                        <ul className="space-y-4">
                            {[
                                { name: "Upcoming Events", path: "/events" },
                                { name: "Travel Experiences", path: "/travel" },
                                { name: "Game Day Leaderboard", path: "/gameday" },
                                { name: "Community Stories", path: "/community" }
                            ].map((link) => (
                                <li key={link.path}>
                                    <Link to={link.path} className="text-white/70 hover:text-white transition-colors flex items-center group">
                                        <span className="group-hover:translate-x-1 transition-transform">{link.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="font-serif text-2xl font-medium mb-8">Company</h3>
                        <ul className="space-y-4">
                            {[
                                { name: "About Us", path: "/about" },
                                { name: "Contact Support", path: "/contact" },
                                { name: "Privacy Policy", path: "#" },
                                { name: "Terms of Service", path: "#" }
                            ].map((link) => (
                                <li key={link.path}>
                                    <Link to={link.path} className="text-white/70 hover:text-white transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="font-serif text-2xl font-medium mb-8">Stay Updated</h3>
                        <p className="text-white/70 mb-6 font-light">
                            Join our newsletter for exclusive invite-only events.
                        </p>
                        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                            <div className="relative">
                                <Input
                                    type="email"
                                    placeholder="email@example.com"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-14 rounded-xl focus-visible:ring-white/20 focus-visible:border-white/30"
                                />
                                <Button type="submit" size="sm" className="absolute right-2 top-2 h-10 w-10 rounded-lg bg-[#fd4c01] text-white hover:bg-[#c94101] p-0">
                                    <ArrowUpRight className="h-5 w-5" />
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-white/40 text-sm">
                    <div className="flex gap-4">
                        <p>&copy; {new Date().getFullYear()} Games and Connect. Made with love in Accra.</p>
                        <p>Designed for Connection.</p>
                    </div>
                    <Link to="/admin/login" className="text-white/70 hover:text-white transition-colors text-xs font-medium">
                        Admin Login
                    </Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
