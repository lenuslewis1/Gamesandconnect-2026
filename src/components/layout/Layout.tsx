import Navbar from "./Navbar";
import Footer from "./Footer";
import { OrganizationSchema, LocalBusinessSchema } from "@/components/seo/StructuredData";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      <OrganizationSchema />
      <LocalBusinessSchema />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
