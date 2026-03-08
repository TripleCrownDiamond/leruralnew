import { Link, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function StickyCategoryNav() {
    const { props } = usePage<any>();
    const categories = props.categories || [];
    const currentUrl = props.ziggy?.location || '';
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [categories]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 200;
            const newScrollLeft = direction === 'left' 
                ? scrollContainerRef.current.scrollLeft - scrollAmount 
                : scrollContainerRef.current.scrollLeft + scrollAmount;
            
            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    if (!categories.length) return null;

    const isActive = (slug: string) => {
        return route().current('category.show', { slug });
    };

    return (
        <div className="sticky top-20 z-40 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-300">
            <div className="container mx-auto px-4">
                <div className="relative flex items-center h-14">
                    {/* Left Gradient & Arrow */}
                    {showLeftArrow && (
                        <>
                            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />
                            <button 
                                onClick={() => scroll('left')}
                                className="absolute left-0 z-20 p-1 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                        </>
                    )}

                    {/* Categories List */}
                    <div 
                        ref={scrollContainerRef}
                        onScroll={checkScroll}
                        className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full px-2 justify-start md:justify-center"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        <Link
                            href="/"
                            className={cn(
                                "flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
                                route().current('welcome') 
                                    ? "bg-primary text-white shadow-md shadow-primary/20" 
                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary"
                            )}
                        >
                            Tout
                        </Link>
                        
                        {categories.map((category: any) => (
                            <Link
                                key={category.slug}
                                href={route('category.show', category.slug)}
                                className={cn(
                                    "flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
                                    isActive(category.slug)
                                        ? "bg-primary text-white shadow-md shadow-primary/20" 
                                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary"
                                )}
                            >
                                {category.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right Gradient & Arrow */}
                    {showRightArrow && (
                        <>
                            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />
                            <button 
                                onClick={() => scroll('right')}
                                className="absolute right-0 z-20 p-1 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}