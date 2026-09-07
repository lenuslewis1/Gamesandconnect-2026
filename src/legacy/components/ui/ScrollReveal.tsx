import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ScrollRevealProps {
    children: ReactNode;
    width?: "fit-content" | "100%";
    delay?: number;
    duration?: number;
    className?: string;
    variant?: "fade-up" | "fade-in" | "scale-up" | "slide-in-right" | "slide-in-left";
    viewportAmount?: number | "some" | "all";
}

const ScrollReveal = ({
    children,
    width = "fit-content",
    delay = 0,
    duration = 0.5,
    className = "",
    variant = "fade-up",
    viewportAmount = 0.3
}: ScrollRevealProps) => {
    const getVariants = () => {
        switch (variant) {
            case "fade-up":
                return {
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0 }
                };
            case "fade-in":
                return {
                    hidden: { opacity: 0 },
                    visible: { opacity: 1 }
                };
            case "scale-up":
                return {
                    hidden: { opacity: 0, scale: 0.95 },
                    visible: { opacity: 1, scale: 1 }
                };
            case "slide-in-right":
                return {
                    hidden: { opacity: 0, x: 50 },
                    visible: { opacity: 1, x: 0 }
                };
            case "slide-in-left":
                return {
                    hidden: { opacity: 0, x: -50 },
                    visible: { opacity: 1, x: 0 }
                };
            default:
                return {
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0 }
                };
        }
    };

    return (
        <div style={{ width }} className={className}>
            <motion.div
                variants={getVariants()}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: viewportAmount }}
                transition={{ duration, delay, ease: "easeOut" }}
            >
                {children}
            </motion.div>
        </div>
    );
};

export default ScrollReveal;
