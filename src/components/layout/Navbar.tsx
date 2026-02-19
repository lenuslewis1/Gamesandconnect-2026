import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Events", path: "/events" },
    { name: "Game Day", path: "/game-day" },
    { name: "Contact", path: "/contact" },
];

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                scrolled
                    ? "bg-background/80 backdrop-blur-md shadow-sm py-4"
                    : "bg-transparent py-6"
            )}
        >
            <div className="container flex items-center justify-between">
                <Link
                    to="/"
                    className="hover:opacity-80 transition-opacity"
                >
                    <img src="/logo.png" alt="Games & Connect" className="h-16 w-auto" />
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden xl:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-[#4d7c0f] relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full",
                                location.pathname === link.path
                                    ? "text-[#4d7c0f] after:w-full"
                                    : "text-muted-foreground"
                            )}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <Button asChild variant="default" size="sm" className="rounded-full">
                        <Link to="/events">Join Now</Link>
                    </Button>
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="xl:hidden p-2 text-foreground"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Navigation */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg animate-fade-in-up xl:hidden">
                    <nav className="container flex flex-col py-8 gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={cn(
                                    "text-lg font-medium py-2 border-b border-border/50 transition-colors",
                                    location.pathname === link.path
                                        ? "text-[#4d7c0f]"
                                        : "text-muted-foreground"
                                )}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Button asChild className="mt-4 w-full rounded-full">
                            <Link to="/events">Join Now</Link>
                        </Button>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Navbar;
