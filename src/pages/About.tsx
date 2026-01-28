import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockTeamMembers } from "@/data/mockData";

const timelineEvents = [
  {
    year: "2022",
    title: "The Beginning",
    description: "Games and Connect started with a small group of friends who wanted to bring fun, competitive games to Accra.",
  },
  {
    year: "2023",
    title: "Growth & Travel",
    description: "We expanded to include travel experiences and launched our first Cape Coast trip with 50 participants.",
  },
  {
    year: "2024",
    title: "Nexus 9 Partnership",
    description: "We partnered with Nexus 9 to create monthly Game Days with four competing teams.",
  },
  {
    year: "2025",
    title: "2,000+ Members",
    description: "Our WhatsApp community grew to over 2,000 members, and we launched Trivia Friday.",
  },
];

const About = () => {
  return (
    <Layout>
      <PageHeader
        title="About Us"
        subtitle="Connecting young people through games, travel, and unforgettable experiences"
      />

      {/* Mission Section */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Our Mission</h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              At Games and Connect, we believe that life is better when we play together. 
              Our mission is to create spaces where young Ghanaians can step away from their 
              screens, meet new people, compete in friendly games, and explore the beautiful 
              landscapes of Ghana.
            </p>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Whether you're a competitive gamer, an adventure seeker, or just looking for 
              a fun way to spend your weekend, we've got something for you. Join us and 
              become part of a growing community that values fun, friendship, and unforgettable 
              experiences.
            </p>
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Our Journey</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              From a small group of friends to Ghana's most vibrant youth community
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-3xl">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 h-full w-0.5 bg-border md:left-1/2 md:-translate-x-1/2" />

              {timelineEvents.map((event, index) => (
                <div key={event.year} className={`relative mb-8 flex items-start gap-6 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  {/* Year Badge */}
                  <div className="absolute left-0 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold md:left-1/2 md:-translate-x-1/2">
                    {event.year}
                  </div>

                  {/* Content */}
                  <Card className={`ml-24 flex-1 md:ml-0 ${index % 2 === 0 ? "md:mr-[calc(50%+2rem)]" : "md:ml-[calc(50%+2rem)]"}`}>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold">{event.title}</h3>
                      <p className="mt-2 text-muted-foreground">{event.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Meet the Team</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              The amazing people behind Games and Connect
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {mockTeamMembers.map((member) => (
              <Card key={member.id} className="text-center transition-all hover:shadow-lg hover:-translate-y-1">
                <CardContent className="p-6">
                  <Avatar className="mx-auto h-24 w-24">
                    <AvatarImage src={member.image} alt={member.name} />
                    <AvatarFallback className="text-2xl">{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="mt-4 text-lg font-semibold">{member.name}</h3>
                  <p className="text-sm text-primary">{member.role}</p>
                  <p className="mt-3 text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Our Values</h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/10">
                <span className="text-3xl">🎮</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold">Fun First</h3>
              <p className="mt-2 text-primary-foreground/80">
                We believe in creating experiences that bring joy and excitement to everyone.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/10">
                <span className="text-3xl">🤝</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold">Community</h3>
              <p className="mt-2 text-primary-foreground/80">
                Building genuine connections and friendships that last beyond our events.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/10">
                <span className="text-3xl">🌍</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold">Exploration</h3>
              <p className="mt-2 text-primary-foreground/80">
                Encouraging everyone to discover new places and step out of their comfort zone.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
