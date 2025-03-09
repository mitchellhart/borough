import React from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import matter from 'gray-matter';
import ReadingProgress from './ReadingProgress';

// Fix Buffer polyfill for browser environment
import { Buffer } from 'buffer';
window.Buffer = Buffer;

function ArticlePage() {
    const { slug } = useParams();
    const [article, setArticle] = React.useState(null);

    // Calculate read time (average reading speed is 200-250 words per minute)
    const calculateReadTime = (content) => {
        const wordsPerMinute = 225;
        const wordCount = content.trim().split(/\s+/).length;
        const readTime = Math.ceil(wordCount / wordsPerMinute);
        return `${readTime} min read`;
    };

    React.useEffect(() => {
        console.log('Attempting to load article with slug:', slug);
        import(`../articles/${slug}.md?raw`)
            .then((module) => {
                const { data: attributes, content } = matter(module.default);
                console.log('Frontmatter data:', attributes);
                console.log('Markdown content:', content);
                
                const readTime = calculateReadTime(content);
                
                // Format both dates as "day month year"
                const formattedData = {
                    ...attributes,
                    date: new Date(attributes.date).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    }),
                    lastUpdated: attributes.lastUpdated 
                        ? new Date(attributes.lastUpdated).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })
                        : undefined,
                    readTime: readTime
                };

                setArticle({
                    content: content,
                    ...formattedData
                });
            })
            .catch((error) => {
                console.error('Error loading article:', error);
                setArticle(null);
            });
    }, [slug]);

    if (!article) {
        return <div>Loading... (Trying to load: {slug})</div>;
    }

    const pageTitle = article.title ? `${article.title} | Boro` : 'Boro';

    // Add JSON-LD structured data
    const structuredData = article ? {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.title,
        "description": article.description,
        "author": {
            "@type": "Person",
            "name": article.author
        },
        "datePublished": article.date,
        "dateModified": article.lastUpdated,
        "image": article.image,
        "articleBody": article.content,
        "keywords": article.tags?.join(','),
        "timeRequired": article.readTime,
        "publisher": {
            "@type": "Organization",
            "name": "Boro",
            "logo": {
                "@type": "ImageObject",
                "url": "https://boroinspect.com/logo.png"
            }
        }
    } : null;

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                {article.description && <meta name="description" content={article.description} />}
                <link rel="canonical" href={`https://boroinspect.com/articles/${slug}`} />
                {/* Add Open Graph tags for better social sharing */}
                <meta property="og:title" content={article.title} />
                <meta property="og:description" content={article.description} />
                {article.image && <meta property="og:image" content={article.image} />}
                <meta property="og:type" content="article" />
                {/* Add article specific meta tags */}
                {article.author && <meta name="author" content={article.author} />}
                {article.tags && <meta name="keywords" content={article.tags.join(', ')} />}
                {structuredData && (
                    <script type="application/ld+json">
                        {JSON.stringify(structuredData)}
                    </script>
                )}
            </Helmet>

            <ReadingProgress />

            <div className="sm:p-8" style={{ backgroundColor: '#E6E2DD' }}>
                <article className="mx-auto max-w-3xl px-4 py-12">
                    {/* Article Header */}
                    <header className="mb-12">
                        {/* Breadcrumb Navigation */}
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
                           
                            <Link to="/articles" className="hover:text-[#395E44]">Articles</Link>
                            <span>→</span>
                            <span>All</span>
                        </div>

                        {/* Title */}
                        <h1 className="text-[#395E44] text-4xl sm:text-5xl font-nohemi leading-tight mb-6">
                            {article.title}
                        </h1>

                        {/* Author Info - Simplified */}
                        <div className="flex items-center gap-3 mb-8">
                            {article.author && (
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-700 text-sm">
                                        {article.author}, {article.authorTitle}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Featured Image */}
                        {article.image && (
                            <div className="rounded-xl overflow-hidden">
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    className="w-full h-[400px] object-cover"
                                />
                            </div>
                        )}
                    </header>

                    {/* Article Content */}
                    <div className="prose prose-lg max-w-none 
                        prose-headings:text-[#395E44] prose-headings:font-nohemi
                        prose-h1:text-5xl prose-h1:mb-8
                        prose-h2:text-4xl prose-h2:mb-6 prose-h2:mt-12 prose-h2:font-nohemi prose-h2:text-[#395E44]
                        prose-h3:text-3xl prose-h3:mb-4
                        prose-h4:text-2xl prose-h4:mb-4
                        prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
                        prose-a:text-[#FFB252] prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-[#395E44] prose-strong:font-bold
                        prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6 prose-ul:space-y-2
                        prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-6
                        prose-li:text-gray-700 prose-li:mb-2 prose-li:marker:text-[#395E44]"
                    >
                        <ReactMarkdown>{article.content}</ReactMarkdown>
                    </div>

                    {/* Article Footer */}
                    <footer className="mt-16 pt-8 border-t border-[#395E44]/20">
                        <div className="flex flex-wrap gap-4">
                            {article.tags && article.tags.length > 0 && (
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-[#395E44] font-nohemi">Related Topics:</span>
                                    {article.tags.map(tag => (
                                        <span 
                                            key={tag}
                                            className="text-[#FFB252] font-nohemi"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </footer>

                    <div className="flex gap-4 mt-8">
                        <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${article.title}&url=${window.location.href}`)}>
                            Share on Twitter
                        </button>
                        <button onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`)}>
                            Share on LinkedIn
                        </button>
                    </div>
                </article>
            {/* Call to Action */}
            <div className="mx-auto max-w-3xl px-4 mb-16 text-center">
                <Link 
                    to="/subscribe"
                    className="inline-block bg-[#FFB252] text-[#395E44] py-4 px-8 rounded-2xl text-lg font-bold hover:bg-opacity-90 transition-colors"
                >
                    Get Started with Boro Inspect
                </Link>
            </div>
            </div>

        </>
    );
}

export default ArticlePage; 