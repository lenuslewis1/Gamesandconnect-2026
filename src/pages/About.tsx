import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Users, Globe, Trophy, CheckCircle2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import TextMotion from "@/components/ui/TextMotion";
import ScrollReveal from "@/components/ui/ScrollReveal";

const About = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488675/_MG_1679_ovnanp.jpg"
            alt="About Hero"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="container relative z-10 text-center text-white">
          <TextMotion
            text="We are here to help you!"
            variant="word"
            className="font-serif text-5xl md:text-7xl font-medium mb-6 block"
          />
          <TextMotion
            text="We're on a mission to cure loneliness by connecting young people through play, travel, and adventure."
            variant="word"
            delay={0.5}
            stagger={0.03}
            className="text-xl text-white/90 max-w-xl mx-auto font-light block"
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[#FFF7ED]">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-[#FDE8D0]">
            {[
              { label: "Community", value: "2k+" },
              { label: "Events", value: "50+" },
              { label: "Destinations", value: "15+" },
              { label: "Happy Faces", value: "99%" },
            ].map((stat, i) => (
              <div key={i} className="p-4">
                <h3 className="font-serif text-4xl font-bold text-[#fd4c01] mb-2">{stat.value}</h3>
                <p className="text-muted-foreground uppercase tracking-widest text-xs font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-background">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16">
            <div className="sticky top-24 h-fit">
              <span className="text-primary font-medium tracking-widest text-sm uppercase block mb-4">Our Values</span>
              <TextMotion text="Values we live by" variant="word" className="font-serif text-4xl md:text-5xl font-medium mb-6 leading-tight block" />
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                We believe in the power of human connection. Every event, trip, and game night is designed to break down barriers and create lasting friendships.
              </p>
              <Button className="rounded-full bg-[#fd4c01] hover:bg-[#c94101] text-white px-8 h-12">
                Join our Community
              </Button>
            </div>

            <div className="space-y-12">
              {[
                {
                  title: "Diversity & Inclusion",
                  desc: "We create spaces where everyone belongs, regardless of background or identity. Our community is a melting pot of cultures.",
                  img: "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915393/_MG_2181_oohsbh.jpg"
                },
                {
                  title: "Adventure & Play",
                  desc: "Life is meant to be enjoyed. We prioritize fun, spontaneous adventures that get you out of your comfort zone.",
                  img: "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915383/_MG_2106_epgam5.jpg"
                },
                {
                  title: "Safety & Respect",
                  desc: "We maintain a safe environment for all our members. Mutual respect is the cornerstone of our community guidelines.",
                  img: "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746918852/_MG_2336_mxnylu.jpg"
                }
              ].map((item, i) => (
                <div key={i} className="group">
                  <div className="aspect-[16/9] rounded-3xl overflow-hidden mb-6">
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <h3 className="font-serif text-2xl font-medium mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhancing Experience Split */}
      <section className="py-24 bg-[#FFF7ED]">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="font-serif text-4xl md:text-5xl font-medium mb-6">
                Enhancing your <br /> experience
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                From seamless booking to curated itineraries, we handle the details so you can focus on the vibes.
              </p>
              <ul className="space-y-4">
                {["Curated Itineraries", "Professional Guides", "Verified Venues", "Secure Payments"].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-foreground/80">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 lg:order-2 relative">
              <div className="aspect-square rounded-[3rem] overflow-hidden">
                <img
                  src="https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488676/_MG_1656_yoiklo.jpg"
                  alt="Experience"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 z-10 bg-white p-6 rounded-3xl shadow-xl max-w-xs">
                <p className="font-serif text-lg italic">"The best weekend of my year. I made friends for life!"</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-background">
        <div className="container text-center">
          <span className="text-primary font-medium tracking-widest text-sm uppercase mb-4 block">Our Squad</span>
          <h2 className="font-serif text-4xl md:text-5xl font-medium mb-16">Meet the Team</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Sarah Jones", role: "Founder & Lead", img: "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746918906/_MG_2027_oblrvo.jpg" },
              { name: "Mike Chen", role: "Head of Games", img: "https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488675/_MG_1414_ij80mu.jpg" },
              { name: "Amara Okeke", role: "Travel Coordinator", img: "https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488675/_MG_1424_f0harp.jpg" }
            ].map((member, i) => (
              <div key={i} className="group text-center">
                <div className="aspect-[3/4] rounded-full overflow-hidden mb-6 w-48 h-64 mx-auto border-4 border-[#FFF7ED] shadow-lg">
                  <img src={member.img} alt={member.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <h3 className="font-serif text-2xl font-medium mb-1">{member.name}</h3>
                <p className="text-muted-foreground text-sm uppercase tracking-wider">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Let's Talk / Contact Section */}
      <section className="py-24 bg-[#FFF7ED]">
        <div className="container">
          <h2 className="font-serif text-4xl mb-12">Let's Talk</h2>
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Form */}
            <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-[#FDE8D0]">
              <form className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input className="bg-[#FFF7ED] border-none h-12 rounded-xl" placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input className="bg-[#FFF7ED] border-none h-12 rounded-xl" placeholder="hello@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea className="bg-[#FFF7ED] border-none rounded-xl min-h-[150px] resize-none" placeholder="How can we help?" />
                </div>
                <Button className="w-full h-12 rounded-full bg-[#fd4c01] hover:bg-[#c94101] text-white">
                  Send Message
                </Button>
              </form>
            </div>

            {/* Image/Info */}
            <div className="relative h-full min-h-[400px] rounded-[2rem] overflow-hidden">
              <img
                src="https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915383/_MG_2106_epgam5.jpg"
                alt="Contact"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute bottom-8 left-8 text-white">
                <p className="font-serif text-2xl mb-2">Visit our HQ</p>
                <p className="opacity-90">East Legon, Accra <br /> Ghana</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 bg-[#fd4c01] my-12 mx-6 md:mx-12 rounded-[3rem] text-white text-center relative overflow-hidden">
        <div className="relative z-10 px-6">
          <h2 className="font-serif text-4xl md:text-6xl font-medium mb-6">Join us today!</h2>
          <p className="max-w-xl mx-auto text-lg opacity-80 mb-8 font-light">
            Ready to start your adventure? Sign up now and become part of our growing family.
          </p>
          <Button className="bg-white text-[#fd4c01] hover:bg-[#FFF7ED] rounded-full px-8 h-12 text-lg">
            Get Started
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default About;
