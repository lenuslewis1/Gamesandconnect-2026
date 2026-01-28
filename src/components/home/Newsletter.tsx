import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const newsletterSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

const Newsletter = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = async (data: NewsletterFormData) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    
    toast({
      title: "Subscribed!",
      description: "You've been added to our newsletter.",
    });
    reset();
  };

  return (
    <section className="bg-primary py-16 text-primary-foreground">
      <div className="container text-center">
        <h2 className="text-3xl font-bold md:text-4xl">Stay in the Loop!</h2>
        <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
          Get the latest updates on events, travel experiences, and exclusive offers delivered straight to your inbox.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <Input
              type="email"
              placeholder="Enter your email"
              className="h-12 bg-primary-foreground text-foreground placeholder:text-muted-foreground"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-left text-sm text-destructive-foreground">{errors.email.message}</p>
            )}
          </div>
          <Button 
            type="submit" 
            size="lg"
            variant="secondary"
            disabled={isLoading}
            className="h-12"
          >
            {isLoading ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;
