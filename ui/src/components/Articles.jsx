import React from 'react';
import { Helmet } from 'react-helmet'; // Install this package for SEO

function Articles() {
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
                    {/* Article cards will go here */}
                </div>
            </div>
        </>
    );
}

export default Articles; 