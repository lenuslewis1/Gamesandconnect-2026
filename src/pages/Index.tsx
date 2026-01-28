import Layout from "@/components/layout/Layout";
import Hero from "@/components/home/Hero";
import QuickActions from "@/components/home/QuickActions";
import FeaturedEvents from "@/components/home/FeaturedEvents";
import TestimonialSlider from "@/components/home/TestimonialSlider";
import Newsletter from "@/components/home/Newsletter";

const Index = () => {
  return (
    <Layout>
      <Hero />
      <QuickActions />
      <FeaturedEvents />
      <TestimonialSlider />
      <Newsletter />
    </Layout>
  );
};

export default Index;
