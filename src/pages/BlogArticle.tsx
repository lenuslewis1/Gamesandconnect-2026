import { useParams, Link, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getBlogArticle, blogArticles } from "@/data/blogData";
import ReactMarkdown from "react-markdown";

const BlogArticle = () => {
    const { slug } = useParams<{ slug: string }>();
    const article = slug ? getBlogArticle(slug) : undefined;

    if (!article) {
        return <Navigate to="/blog" replace />;
    }

    // Get related articles (same category, excluding current)
    const relatedArticles = blogArticles
        .filter(a => a.slug !== article.slug)
        .slice(0, 2);

    return (
        <Layout>
            <SEOHead
                title={article.title}
                description={article.description}
                canonical={`/blog/${article.slug}`}
                ogType="article"
            />
            <BreadcrumbSchema items={[
                { name: "Home", url: "/" },
                { name: "Blog", url: "/blog" },
                { name: article.title, url: `/blog/${article.slug}` }
            ]} />

            {/* Article Header */}
            <section className="py-16 bg-[#FFF7ED]">
                <div className="container max-w-3xl">
                    <ScrollReveal>
                        <Link to="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
                            <ArrowLeft className="h-4 w-4" /> Back to Blog
                        </Link>
                        <Badge variant="secondary" className="mb-4">
                            {article.category}
                        </Badge>
                        <h1 className="font-serif text-4xl md:text-5xl font-medium mb-4">
                            {article.title}
                        </h1>
                        <p className="text-lg text-muted-foreground mb-6">
                            {article.description}
                        </p>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{article.author}</span>
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(article.publishDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {article.readTime}
                            </span>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Article Content */}
            <section className="py-16">
                <div className="container max-w-3xl">
                    <ScrollReveal>
                        <article className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:font-medium prose-a:text-primary prose-strong:text-foreground">
                            <ReactMarkdown>{article.content}</ReactMarkdown>
                        </article>
                    </ScrollReveal>
                </div>
            </section>

            {/* Tags */}
            <section className="pb-12">
                <div className="container max-w-3xl">
                    <div className="flex flex-wrap gap-2">
                        {article.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>
            </section>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
                <section className="py-16 bg-[#FFF7ED]">
                    <div className="container max-w-3xl">
                        <h2 className="font-serif text-2xl font-medium mb-8">More from the Blog</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {relatedArticles.map((related) => (
                                <Link key={related.slug} to={`/blog/${related.slug}`} className="group">
                                    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                        <Badge variant="secondary" className="mb-2 text-xs">
                                            {related.category}
                                        </Badge>
                                        <h3 className="font-serif text-lg font-medium mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                            {related.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                                            {related.description}
                                        </p>
                                        <span className="inline-flex items-center gap-1 text-primary text-sm font-medium">
                                            Read Article <ArrowRight className="h-3 w-3" />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="py-16">
                <div className="container max-w-3xl text-center">
                    <h2 className="font-serif text-2xl font-medium mb-4">Ready to Join the Fun?</h2>
                    <p className="text-muted-foreground mb-6">
                        Games and Connect hosts events every month in Accra. See what's coming up next.
                    </p>
                    <Button asChild className="rounded-full h-12 px-6">
                        <Link to="/events">Browse Events</Link>
                    </Button>
                </div>
            </section>
        </Layout>
    );
};

export default BlogArticle;
