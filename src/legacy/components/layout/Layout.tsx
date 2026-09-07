import Navbar from "./Navbar";
import Footer from "./Footer";
import { useLocation } from "react-router-dom";
import { OrganizationSchema, LocalBusinessSchema } from "@/components/seo/StructuredData";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { pathname } = useLocation();
  return (
    <div className="gc-inner-page flex min-h-screen flex-col" data-page={pathname}>
      <OrganizationSchema />
      <LocalBusinessSchema />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
