import { RefObject, useEffect, useState } from 'react';

export default function useInViewMount<T extends HTMLElement>(
    ref: RefObject<T | null>,
    rootMargin = '280px 0px',
) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        if (isMounted) {
            return;
        }

        if (typeof window === 'undefined') {
            setIsMounted(true);
            return;
        }

        const node = ref.current;
        if (!node) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const firstEntry = entries[0];
                if (firstEntry?.isIntersecting) {
                    setIsMounted(true);
                    observer.disconnect();
                }
            },
            { rootMargin },
        );

        observer.observe(node);

        return () => observer.disconnect();
    }, [isMounted, ref, rootMargin]);

    return isMounted;
}
