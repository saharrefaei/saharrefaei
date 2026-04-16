import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function MagneticButton({ children, href }: { children: React.ReactNode, href: string }) {
    const ref = useRef<HTMLAnchorElement>(null!);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouse = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current.getBoundingClientRect();
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);
        setPosition({ x: middleX * 0.4, y: middleY * 0.4 });
    };

    const reset = () => {
        setPosition({ x: 0, y: 0 });
    };

    const { x, y } = position;

    return (
        <motion.a
            ref={ref}
            href={href}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            animate={{ x, y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className="glass-panel"
            style={{
                display: 'inline-flex',
                padding: '1.5rem 5rem',
                color: 'white',
                textDecoration: 'none',
                fontSize: '1.5rem',
                fontWeight: 600,
                borderRadius: '50px',
                cursor: 'none',
                boxShadow: '0 0 30px rgba(107, 70, 193, 0.4)'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            {children}
        </motion.a>
    );
}
