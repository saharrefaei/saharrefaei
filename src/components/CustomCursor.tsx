import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isPointer, setIsPointer] = useState(false);

    useEffect(() => {
        const updateMousePosition = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });

            // Basic checking if hovering over clickable elements
            const target = e.target as HTMLElement;
            if (target && (target.tagName.toLowerCase() === 'a' || target.tagName.toLowerCase() === 'button' || target.style.cursor === 'pointer')) {
                setIsPointer(true);
            } else {
                setIsPointer(false);
            }
        };

        window.addEventListener('mousemove', updateMousePosition);
        return () => window.removeEventListener('mousemove', updateMousePosition);
    }, []);

    // Only render cursor if device has a fine pointer (not touch)
    if (typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches) return null;

    return (
        <>
            <motion.div
                style={{
                    position: 'fixed', left: 0, top: 0, width: 6, height: 6, borderRadius: '50%',
                    backgroundColor: 'white', pointerEvents: 'none', zIndex: 9999,
                }}
                animate={{
                    x: mousePosition.x - 3,
                    y: mousePosition.y - 3,
                    scale: isPointer ? 1.5 : 1
                }}
                transition={{ type: 'tween', ease: 'backOut', duration: 0.1 }}
            />
            <motion.div
                style={{
                    position: 'fixed', left: 0, top: 0, width: 40, height: 40, borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.4)', pointerEvents: 'none', zIndex: 9998,
                    backgroundColor: isPointer ? 'rgba(255,255,255,0.1)' : 'transparent'
                }}
                animate={{
                    x: mousePosition.x - 20,
                    y: mousePosition.y - 20,
                    scale: isPointer ? 1.5 : 1
                }}
                transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.5 }}
            />
        </>
    );
}
