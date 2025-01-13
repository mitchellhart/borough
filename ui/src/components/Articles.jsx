import React from 'react';
import { Helmet } from 'react-helmet';
import { useArticles } from '../hooks/useArticles';

function Articles() {
    const { articles } = useArticles();

    return (
        <>
            <Helmet>
                <title>Home Inspection Insights & Tips | Borough</title>
                <meta 
                    name="description" 
                    content="Expert insights on home inspections, maintenance tips, and property buying guides. Learn how to make informed decisions about your next home purchase."
                />
                <meta 
                    name="keywords" 
                    content="home inspection, property maintenance, home buying tips, real estate inspection"
                />
                <link rel="canonical" href="https://yourwebsite.com/articles" />
            </Helmet>

            <div className="mx-auto max-w-6xl px-4 py-12">
                <h1 className="text-4xl font-nohemi text-[#395E44] mb-12">Home Inspection Resources</h1>
                
                {/* Articles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map((article, index) => (
                        <article key={index} className="rounded-xl overflow-hidden shadow-lg">
                            <img 
                                src={article.image}
                                alt={article.title} 
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-6 bg-white">
                                <h3 className="text-xl font-nohemi text-[#395E44] mb-2">
                                    <a href={`/articles/${article.slug}`} className="hover:text-[#FFB252]">
                                        {article.title}
                                    </a>
                                </h3>
                                <p className="text-gray-600 mb-4">{article.description}</p>
                                <div className="flex items-center text-sm text-gray-500">
                                    <span>{article.readTime}</span>
                                    <span className="mx-2">•</span>
                                    <span>{new Date(article.date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</span>
                                </div>
                                {/* Additional metadata */}
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {article.tags && article.tags.map((tag, tagIndex) => (
                                        <span 
                                            key={tagIndex}
                                            className="bg-[#E6E2DD] text-[#395E44] px-3 py-1 rounded-full text-sm"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </>
    );
}

export default Articles; 