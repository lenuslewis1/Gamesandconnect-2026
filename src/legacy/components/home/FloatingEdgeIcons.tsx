"use client";

import { motion } from "framer-motion";

interface FloatingIcon {
    emoji: string;
    position: { top?: string; bottom?: string; left?: string; right?: string };
    delay: number;
    size?: string;
    rotation?: number;
}

const floatingIcons: FloatingIcon[] = [
    // Left side icons
    { emoji: "⚽", position: { top: "15%", left: "2%" }, delay: 0, size: "text-3xl", rotation: -15 },
    { emoji: "🏕️", position: { top: "35%", left: "3%" }, delay: 0.3, size: "text-4xl", rotation: 10 },
    { emoji: "🎯", position: { top: "55%", left: "1%" }, delay: 0.6, size: "text-2xl", rotation: -5 },
    { emoji: "🏐", position: { top: "75%", left: "4%" }, delay: 0.9, size: "text-3xl", rotation: 20 },

    // Right side icons
    { emoji: "✈️", position: { top: "12%", right: "2%" }, delay: 0.2, size: "text-4xl", rotation: 15 },
    { emoji: "🏹", position: { top: "30%", right: "3%" }, delay: 0.5, size: "text-3xl", rotation: -10 },
    { emoji: "🎒", position: { top: "50%", right: "1%" }, delay: 0.8, size: "text-3xl", rotation: 5 },
    { emoji: "🏓", position: { top: "70%", right: "4%" }, delay: 1.1, size: "text-2xl", rotation: -20 },

    // Top scattered icons
    { emoji: "🧭", position: { top: "8%", left: "20%" }, delay: 0.4, size: "text-2xl", rotation: 25 },
    { emoji: "🎮", position: { top: "5%", right: "25%" }, delay: 0.7, size: "text-3xl", rotation: -8 },

    // Bottom scattered icons
    { emoji: "🌴", position: { bottom: "12%", left: "8%" }, delay: 1.0, size: "text-4xl", rotation: 12 },
    { emoji: "🎪", position: { bottom: "8%", right: "10%" }, delay: 1.3, size: "text-3xl", rotation: -15 },
    { emoji: "🏄", position: { bottom: "15%", left: "25%" }, delay: 0.2, size: "text-2xl", rotation: 8 },
    { emoji: "⛺", position: { bottom: "10%", right: "30%" }, delay: 0.5, size: "text-3xl", rotation: -5 },
];

export const FloatingEdgeIcons = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden hidden lg:block">
            {floatingIcons.map((icon, index) => (
                <motion.div
                    key={index}
                    className={`absolute ${icon.size || "text-3xl"} opacity-20 select-none`}
                    style={{
                        ...icon.position,
                        rotate: icon.rotation || 0,
                    }}
                    initial={{ opacity: 0, scale: 0, y: 20 }}
                    animate={{
                        opacity: 0.15,
                        scale: 1,
                        y: [0, -10, 0],
                    }}
                    transition={{
                        opacity: { delay: icon.delay, duration: 0.8 },
                        scale: { delay: icon.delay, duration: 0.6, type: "spring" },
                        y: {
                            delay: icon.delay + 0.5,
                            duration: 4 + Math.random() * 2,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut",
                        },
                    }}
                >
                    <span className="drop-shadow-md">{icon.emoji}</span>
                </motion.div>
            ))}
        </div>
    );
};

export default FloatingEdgeIcons;
