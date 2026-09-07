import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/layout/PageHeader";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <PageHeader title="A little off track." subtitle="We couldn't find this page. Let's get you back to the good times.">
        <a href="/" className="gc-button inline-flex mt-8">
          Return to Home
        </a>
      </PageHeader>
    </Layout>
  );
};

export default NotFound;
