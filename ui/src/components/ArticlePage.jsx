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
                
                // Format both dates if they exist
                const formattedData = {
                    ...attributes,
                    date: attributes.date instanceof Date 
                        ? attributes.date.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })
                        : attributes.date,
                    lastUpdated: attributes.lastUpdated instanceof Date
                        ? attributes.lastUpdated.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })
                        : attributes.lastUpdated,
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

            {/* Added container with rounded corners and background */}
            <div className="rounded-3xl sm:p-8 my-10" style={{ backgroundColor: '#E6E2DD' }}>
                <article className="mx-auto max-w-3xl px-4 py-12">
                    {/* Article Header */}
                    <header className="mb-12">
                        {/* Category Tag */}
                        {article.category && (
                            <div className="mb-6">
                                <span className="bg-[#FFB252] text-[#395E44] px-4 py-2 rounded-full text-sm font-bold">
                                    {article.category}
                                </span>
                            </div>
                        )}

                        {/* Title */}
                        <h1 className="text-[#395E44] text-4xl sm:text-5xl font-nohemi leading-tight mb-6">
                            {article.title}
                        </h1>

                        {/* Article Meta */}
                        <div className="flex flex-wrap items-center text-[#395E44] text-lg gap-4 mb-8">
                            {article.author && (
                                <span className="flex items-center font-nohemi">
                                    By {article.author}
                                </span>
                            )}
                            <time dateTime={article.date} className="font-nohemi">
                                Published: {article.date}
                            </time>
                            {article.lastUpdated && (
                                <time dateTime={article.lastUpdated} className="font-nohemi">
                                    Updated: {article.lastUpdated}
                                </time>
                            )}
                            <span className="font-nohemi">{article.readTime}</span>
                        </div>

                        {/* Tags */}
                        {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-8">
                                {article.tags.map(tag => (
                                    <span 
                                        key={tag}
                                        className="bg-white text-[#395E44] px-3 py-1 rounded-xl text-sm font-nohemi"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Featured Image */}
                        {article.image && (
                            <div className="mb-8 rounded-xl overflow-hidden">
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    className="w-full h-[400px] object-cover"
                                />
                            </div>
                        )}
                    </header>

                    {/* Article Content */}
                    <div className="prose prose-lg max-w-none">
                        <div className="prose prose-lg max-w-none 
                            prose-headings:text-[#395E44] prose-headings:font-nohemi
                            prose-h1:text-4xl prose-h1:mb-8
                            prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-12 prose-h2:font-nohemi prose-h2:text-[#395E44]
                            prose-h3:text-2xl prose-h3:mb-4
                            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
                            prose-a:text-[#FFB252] prose-a:no-underline hover:prose-a:underline
                            prose-strong:text-[#395E44] prose-strong:font-bold
                            prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6
                            prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-6
                            prose-li:mb-2"
                        >
                            <ReactMarkdown>{article.content}</ReactMarkdown>
                        </div>
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
            </div>

            {/* Call to Action */}
            <div className="mx-auto max-w-3xl px-4 mb-16 text-center">
                <Link 
                    to="/subscribe"
                    className="inline-block bg-[#FFB252] text-[#395E44] py-4 px-8 rounded-2xl text-lg font-bold hover:bg-opacity-90 transition-colors"
                >
                    Get Started with Boro Inspect
                </Link>
            </div>
        </>
    );
}

export default ArticlePage; 