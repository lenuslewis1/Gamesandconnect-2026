import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { blogArticles } from "@/data/blogData";
import PageHeader from "@/components/layout/PageHeader";

const Blog = () => {
    return (
        <Layout>
            <SEOHead
                title="Blog — Games, Travel & Social Events in Ghana"
                description="Read the latest articles about team building, social events, travel tips, and fun activities in Accra and across Ghana from Games and Connect."
                canonical="/blog"
            />
            <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Blog", url: "/blog" }]} />

            <PageHeader
                title="The Connect Blog"
                subtitle="Tips, guides, and stories about games, travel, and social life in Ghana"
            />

            <section className="py-24">
                <div className="container">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogArticles.map((article, i) => (
                            <ScrollReveal key={article.slug} delay={i * 0.1}>
                                <Link to={`/blog/${article.slug}`}>
                                    <Card className="h-full border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer overflow-hidden">
                                        {article.image && (
                                            <div className="aspect-video bg-muted">
                                                <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <CardContent className="pt-6 pb-6">
                                            <Badge variant="secondary" className="mb-3 text-xs">
                                                {article.category}
                                            </Badge>
                                            <h2 className="font-serif text-xl font-medium mb-2 line-clamp-2">
                                                {article.title}
                                            </h2>
                                            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                                                {article.description}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(article.publishDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {article.readTime}
                                                </span>
                                            </div>
                                            <span className="inline-flex items-center gap-1 text-primary text-sm font-medium mt-4">
                                                Read Article <ArrowRight className="h-3 w-3" />
                                            </span>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default Blog;
