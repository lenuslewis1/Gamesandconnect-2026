"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

interface CursorFollowerProps {
    /** Size of the outer ring in pixels */
    ringSize?: number;
    /** Size of the inner dot in pixels */
    dotSize?: number;
    /** Color of the cursor elements (CSS color value) */
    color?: string;
    /** Whether to show on mobile devices */
    showOnMobile?: boolean;
}

export const CursorFollower = ({
    ringSize = 40,
    dotSize = 8,
    color = "hsl(32, 30%, 35%)",
    showOnMobile = false,
}: CursorFollowerProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [isClicking, setIsClicking] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Motion values for smooth cursor tracking
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    // Spring configs for smooth, organic movement
    const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
    const ringSpringConfig = { damping: 20, stiffness: 150, mass: 0.8 };

    // Smooth spring animations
    const dotX = useSpring(cursorX, springConfig);
    const dotY = useSpring(cursorY, springConfig);
    const ringX = useSpring(cursorX, ringSpringConfig);
    const ringY = useSpring(cursorY, ringSpringConfig);

    // Handle mouse movement
    const handleMouseMove = useCallback((e: MouseEvent) => {
        cursorX.set(e.clientX);
        cursorY.set(e.clientY);
        if (!isVisible) setIsVisible(true);
    }, [cursorX, cursorY, isVisible]);

    // Handle mouse enter/leave viewport
    const handleMouseEnter = useCallback(() => setIsVisible(true), []);
    const handleMouseLeave = useCallback(() => setIsVisible(false), []);

    // Handle mouse down/up for click animation
    const handleMouseDown = useCallback(() => setIsClicking(true), []);
    const handleMouseUp = useCallback(() => setIsClicking(false), []);

    // Detect hoverable elements
    const handleElementHover = useCallback((e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const isInteractive =
            target.tagName === "A" ||
            target.tagName === "BUTTON" ||
            target.closest("a") ||
            target.closest("button") ||
            target.closest("[role='button']") ||
            target.closest("[data-cursor-hover]") ||
            target.classList.contains("cursor-pointer") ||
            getComputedStyle(target).cursor === "pointer";

        setIsHovering(!!isInteractive);
    }, []);

    useEffect(() => {
        // Check if mobile device
        const checkMobile = () => {
            const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
            const isSmallScreen = window.innerWidth < 768;
            setIsMobile(isTouchDevice || isSmallScreen);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);

        // Only add event listeners if not mobile (unless showOnMobile is true)
        if (!isMobile || showOnMobile) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mousemove", handleElementHover);
            document.body.addEventListener("mouseenter", handleMouseEnter);
            document.body.addEventListener("mouseleave", handleMouseLeave);
            window.addEventListener("mousedown", handleMouseDown);
            window.addEventListener("mouseup", handleMouseUp);
        }

        return () => {
            window.removeEventListener("resize", checkMobile);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mousemove", handleElementHover);
            document.body.removeEventListener("mouseenter", handleMouseEnter);
            document.body.removeEventListener("mouseleave", handleMouseLeave);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isMobile, showOnMobile, handleMouseMove, handleElementHover, handleMouseEnter, handleMouseLeave, handleMouseDown, handleMouseUp]);

    // Don't render on mobile unless explicitly enabled
    if (isMobile && !showOnMobile) return null;

    return (
        <>
            {/* Outer Ring - follows with delay */}
            <motion.div
                className="fixed pointer-events-none z-[9999] mix-blend-difference"
                style={{
                    x: ringX,
                    y: ringY,
                    width: ringSize,
                    height: ringSize,
                    marginLeft: -ringSize / 2,
                    marginTop: -ringSize / 2,
                }}
                animate={{
                    scale: isHovering ? 1.5 : isClicking ? 0.8 : 1,
                    opacity: isVisible ? 1 : 0,
                }}
                transition={{
                    scale: { type: "spring", damping: 20, stiffness: 300 },
                    opacity: { duration: 0.2 },
                }}
            >
                <div
                    className="w-full h-full rounded-full border-2 transition-colors duration-200"
                    style={{
                        borderColor: isHovering ? "hsl(40, 60%, 70%)" : color,
                    }}
                />
            </motion.div>

            {/* Inner Dot - follows more closely */}
            <motion.div
                className="fixed pointer-events-none z-[9999] mix-blend-difference rounded-full"
                style={{
                    x: dotX,
                    y: dotY,
                    width: dotSize,
                    height: dotSize,
                    marginLeft: -dotSize / 2,
                    marginTop: -dotSize / 2,
                    backgroundColor: color,
                }}
                animate={{
                    scale: isHovering ? 0 : isClicking ? 2 : 1,
                    opacity: isVisible ? 1 : 0,
                }}
                transition={{
                    scale: { type: "spring", damping: 20, stiffness: 400 },
                    opacity: { duration: 0.15 },
                }}
            />
        </>
    );
};

export default CursorFollower;
