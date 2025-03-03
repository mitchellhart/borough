import React from 'react';
import { Helmet } from 'react-helmet';
import { useArticles } from '../hooks/useArticles';
import { Link } from 'react-router-dom';

function Articles() {
    const { articles } = useArticles();
    
    console.log("Fetched articles:", articles);

    return (
        <>
            <Helmet>
                <title>Home Inspection Insights & Tips | Boro</title>
                <meta 
                    name="description" 
                    content="Expert insights on home inspections, maintenance tips, and property buying guides. Learn how to make informed decisions about your next home purchase."
                />
                <meta 
                    name="keywords" 
                    content="home inspection, property maintenance, home buying tips, real estate inspection"
                />
                <link rel="canonical" href="https://boroinspect.com/articles" />
            </Helmet>

            <div className="mx-auto p-16 bg-[#E6E2DD] min-h-screen">
                <h1 className="text-7xl font-nohemi text-[#395E44] mb-12 text-left">The Boro Blog</h1>
                
                {/* Articles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {articles.map((article, index) => (
                        index === 0 ? (
                            // Featured Article (Full Width)
                            <Link 
                                key={index} 
                                to={`/articles/${article.slug}`} 
                                className="col-span-full block rounded-xl overflow-hidden transition-shadow duration-300 hover:shadow-lg"
                            >
                                <article className="flex flex-col h-full max-h-[540px]">
                                    <div className="md:flex">
                                        <div className="md:w-1/2">
                                            <img
                                                src={article.image}
                                                alt={article.title}
                                                className="w-full h-64 md:h-full object-cover"
                                            />
                                        </div>
                                        <div className="md:w-1/2 p-6 bg-white flex flex-col h-full">
                                            {article.category && (
                                                <p className="text-sm text-gray-800 uppercase tracking-widest mb-2">
                                                    {article.category}
                                                </p>
                                            )}
                                            <h3 className="text-2xl md:text-3xl font-nohemi text-[#395E44] mb-4">
                                                {article.title}
                                            </h3>
                                            <p className="text-gray-600 mb-4">{article.description}</p>
                                            <div className="mt-auto">
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
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ) : (
                            // Regular Article
                            <Link 
                                key={index} 
                                to={`/articles/${article.slug}`} 
                                className="block rounded-xl overflow-hidden transition-shadow duration-300 hover:shadow-lg"
                            >
                                <article className="flex flex-col h-full shadow-none">
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="p-6 bg-white flex flex-col flex-grow">
                                        {article.category && (
                                            <p className="text-sm text-gray-500 uppercase tracking-widest mb-2">
                                                {article.category}
                                            </p>
                                        )}
                                        <h3 className="text-xl font-nohemi text-[#395E44] mb-2">
                                            {article.title}
                                        </h3>
                                        <p className="text-gray-600 mb-4">{article.description}</p>
                                        <div className="mt-auto">
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
                                    </div>
                                </article>
                            </Link>
                        )
                    ))}
                </div>
            </div>
        </>
    );
}

export default Articles; 