import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockTestimonials } from "@/data/mockData";

const TestimonialSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mockTestimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + mockTestimonials.length) % mockTestimonials.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % mockTestimonials.length);
  };

  const testimonial = mockTestimonials[currentIndex];

  return (
    <section className="bg-muted/30 py-16">
      <div className="container">
        <div className="text-center">
          <h2 className="text-3xl font-bold md:text-4xl">What People Say</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Hear from our amazing community members about their experiences.
          </p>
        </div>

        <div className="relative mx-auto mt-12 max-w-3xl">
          <Card className="border-none bg-card shadow-lg">
            <CardContent className="p-8 text-center">
              <Quote className="mx-auto h-10 w-10 text-primary/20" />
              <p className="mt-6 text-lg text-card-foreground md:text-xl">
                "{testimonial.content}"
              </p>
              <div className="mt-8 flex flex-col items-center gap-3">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                  <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 md:-left-12">
            <Button variant="ghost" size="icon" onClick={goToPrevious} className="rounded-full">
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </div>
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 md:-right-12">
            <Button variant="ghost" size="icon" onClick={goToNext} className="rounded-full">
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Dots */}
          <div className="mt-6 flex justify-center gap-2">
            {mockTestimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentIndex ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSlider;
