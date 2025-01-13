import React, { useState, useEffect } from 'react';

function ReadingProgress() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const updateProgress = () => {
            // Calculate how far the user has scrolled
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const readingProgress = scrollTop / docHeight;
            setProgress(readingProgress);
        };

        // Add scroll event listener
        window.addEventListener('scroll', updateProgress);
        
        // Cleanup
        return () => window.removeEventListener('scroll', updateProgress);
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
            <div 
                className="h-full bg-[#FFB252] transition-all duration-200"
                style={{ width: `${progress * 100}%` }}
            />
        </div>
    );
}

export default ReadingProgress; 