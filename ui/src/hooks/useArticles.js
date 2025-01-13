import { useState, useEffect } from 'react';
import matter from 'gray-matter';

export function useArticles() {
    const [articles, setArticles] = useState([]);

    useEffect(() => {
        const loadArticles = async () => {
            try {
                // Import all markdown files from the articles directory
                const articleFiles = import.meta.glob('../articles/*.md', { as: 'raw' });
                
                const articleEntries = await Promise.all(
                    Object.entries(articleFiles).map(async ([path, loader]) => {
                        const content = await loader();
                        const { data: frontmatter } = matter(content);
                        
                        // Extract slug from filename
                        const slug = path.split('/').pop().replace('.md', '');
                        
                        return {
                            ...frontmatter,
                            slug,
                            // Ensure all required fields are present
                            title: frontmatter.title || 'Untitled',
                            date: frontmatter.date || new Date().toISOString(),
                            readTime: frontmatter.readTime || '5 min',
                            description: frontmatter.description || '',
                            image: frontmatter.image || '/default-image.jpg'
                        };
                    })
                );

                // Sort articles by date, newest first
                const sortedArticles = articleEntries.sort((a, b) => 
                    new Date(b.date) - new Date(a.date)
                );

                setArticles(sortedArticles);
            } catch (error) {
                console.error('Error loading articles:', error);
                setArticles([]);
            }
        };

        loadArticles();
    }, []);

    return { articles };
} 