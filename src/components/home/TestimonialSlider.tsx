import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah A.",
    role: "Travel Enthusiast",
    content: "The Cape Coast trip was absolutely magical. I went alone but left with 5 new best friends. The vibe was immaculate from start to finish.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
  },
  {
    name: "Michael K.",
    role: "Gamer",
    content: "I've never been to a game night this organized and fun. The FIFA tournament was intense! Can't wait for the next one.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
  },
  {
    name: "Jessica T.",
    role: "Trivia Queen",
    content: "Finally, a place where being a nerd is celebrated! The trivia night questions were challenging but so much fun.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop"
  },
  {
    name: "David O.",
    role: "Community Member",
    content: "Games and Connect is exactly what Accra needed. A safe, fun space to just be yourself and meet genuine people.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop"
  }
];

const TestimonialSlider = () => {
  return (
    <div className="container">
      <div className="text-center mb-16">
        <h2 className="font-serif text-3xl md:text-5xl font-medium mb-4">Community Stories</h2>
        <p className="text-muted-foreground max-w-xl mx-auto text-lg hover:text-primary transition-colors cursor-default">
          Hear from the people who make our community special.
        </p>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full max-w-5xl mx-auto"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {testimonials.map((testimonial, index) => (
            <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
              <div className="p-1 h-full">
                <Card className="h-full border-none shadow-none bg-muted/20 hover:bg-muted/40 transition-colors duration-300">
                  <CardContent className="flex flex-col p-8 h-full">
                    <Quote className="h-8 w-8 text-primary/20 mb-6" />
                    <p className="text-muted-foreground flex-1 leading-relaxed mb-8 italic">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-4 mt-auto">
                      <Avatar className="h-10 w-10 border border-primary/10">
                        <AvatarImage src={testimonial.image} alt={testimonial.name} />
                        <AvatarFallback className="text-xs">{testimonial.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-serif font-semibold text-foreground">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex justify-center gap-2 mt-8">
          <CarouselPrevious className="static translate-y-0 mr-2 border-border/50 hover:bg-primary hover:text-white" />
          <CarouselNext className="static translate-y-0 border-border/50 hover:bg-primary hover:text-white" />
        </div>
      </Carousel>
    </div>
  );
};

export default TestimonialSlider;
