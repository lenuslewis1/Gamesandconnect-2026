import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Newsletter = () => {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-medium mb-4">
            Join the Inner Circle
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Get exclusive access to secret events, early discounts on travel packages,
            and community stories delivered to your inbox.
          </p>

          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-background h-12 rounded-full px-6 border-border/60 focus-visible:ring-primary/20"
            />
            <Button type="submit" size="lg" className="rounded-full h-12 px-8">
              Subscribe
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-4">
            We respect your inbox. No spam, ever.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
