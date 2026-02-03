import { motion } from "framer-motion";
import { ReactNode } from "react";

interface TextMotionProps {
    text: string;
    variant?: "word" | "letter" | "typing";
    delay?: number;
    stagger?: number;
    className?: string;
    once?: boolean;
}

const TextMotion = ({
    text,
    variant = "word",
    delay = 0,
    stagger = 0.05,
    className = "",
    once = true
}: TextMotionProps) => {
    const words = text.split(" ");
    const letters = text.split("");

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: (i: number = 1) => ({
            opacity: 1,
            transition: { staggerChildren: stagger, delayChildren: delay * i },
        }),
    };

    const childVariants = {
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring" as any,
                damping: 12,
                stiffness: 100,
            },
        },
        hidden: {
            opacity: 0,
            y: 20,
            transition: {
                type: "spring" as any,
                damping: 12,
                stiffness: 100,
            },
        },
    };

    const typingVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: delay,
            }
        }
    };

    const charVariants = {
        hidden: { opacity: 0, display: "none" },
        visible: { opacity: 1, display: "inline-block" }
    };

    if (variant === "typing") {
        return (
            <motion.span
                variants={typingVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once }}
                className={className}
            >
                {letters.map((char, index) => (
                    <motion.span key={index} variants={charVariants}>
                        {char}
                    </motion.span>
                ))}
            </motion.span>
        );
    }

    if (variant === "letter") {
        return (
            <motion.span
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once }}
                className={`inline-block ${className}`}
            >
                {letters.map((char, index) => (
                    <motion.span
                        key={index}
                        variants={childVariants}
                        className="inline-block"
                        style={{ whiteSpace: char === " " ? "pre" : "normal" }}
                    >
                        {char}
                    </motion.span>
                ))}
            </motion.span>
        );
    }

    return (
        <motion.span
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once }}
            className={`inline-block ${className}`}
        >
            {words.map((word, index) => (
                <motion.span
                    key={index}
                    variants={childVariants}
                    className="inline-block mr-[0.25em]"
                >
                    {word}
                </motion.span>
            ))}
        </motion.span>
    );
};

export default TextMotion;
