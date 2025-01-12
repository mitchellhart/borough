import React from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import matter from 'gray-matter';

// Fix Buffer polyfill for browser environment
import { Buffer } from 'buffer';
window.Buffer = Buffer;

function ArticlePage() {
    const { slug } = useParams();
    const [article, setArticle] = React.useState(null);

    React.useEffect(() => {
        console.log('Attempting to load article with slug:', slug);
        import(`../articles/${slug}.md`)
            .then(async (module) => {
                const response = await fetch(module.default);
                const rawContent = await response.text();
                
                const { data, content } = matter(rawContent);
                console.log('Frontmatter data:', data);
                console.log('Markdown content:', content);
                
                // Format the date if it's a Date object
                const formattedData = {
                    ...data,
                    date: data.date instanceof Date 
                        ? data.date.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })
                        : data.date
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

    const pageTitle = article.title ? `${article.title} | Borough` : 'Borough';

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                {article.description && <meta name="description" content={article.description} />}
                <link rel="canonical" href={`https://yourwebsite.com/articles/${slug}`} />
                {/* Add Open Graph tags for better social sharing */}
                <meta property="og:title" content={article.title} />
                <meta property="og:description" content={article.description} />
                {article.image && <meta property="og:image" content={article.image} />}
                <meta property="og:type" content="article" />
                {/* Add article specific meta tags */}
                {article.author && <meta name="author" content={article.author} />}
                {article.tags && <meta name="keywords" content={article.tags.join(', ')} />}
            </Helmet>

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
                            <time dateTime={article.date} className="font-nohemi">{article.date}</time>
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
                </article>
            </div>

            {/* Call to Action */}
            <div className="mx-auto max-w-3xl px-4 mb-16 text-center">
                <Link 
                    to="/subscribe"
                    className="inline-block bg-[#FFB252] text-[#395E44] py-4 px-8 rounded-2xl text-lg font-bold hover:bg-opacity-90 transition-colors"
                >
                    Get Started with Borough
                </Link>
            </div>
        </>
    );
}

export default ArticlePage; 