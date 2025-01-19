const fs = require('fs');
const { globby } = require('globby'); 
const matter = require('gray-matter');

async function generateSitemap() {
    // Get all .md files from the articles directory
    const articles = await globby(['src/articles/*.md']);
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <!-- Static pages -->
    <url>
        <loc>https://boroinspect.com</loc>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://boroinspect.com/articles</loc>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>https://boroinspect.com/about</loc>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>https://boroinspect.com/pricing</loc>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>https://boroinspect.com/subscribe</loc>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
    </url>
    <url>
        <loc>https://boroinspect.com/terms</loc>
        <changefreq>monthly</changefreq>
        <priority>0.2</priority>
    </url>
    ${articles
        .map(article => {
            // Read the markdown file
            const fileContent = fs.readFileSync(article, 'utf8');
            const { data } = matter(fileContent);
            const slug = article.replace('src/articles/', '').replace('.md', '');
            
            return `
    <url>
        <loc>https://boroinspect.com/articles/${slug}</loc>
        <lastmod>${data.lastUpdated || data.date}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>`;
        })
        .join('')}
</urlset>`;

    // Write sitemap to public directory
    fs.writeFileSync('public/sitemap.xml', sitemap);
    console.log('Sitemap generated successfully!');
}

generateSitemap(); 