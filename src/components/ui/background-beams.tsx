"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BackgroundBeams = ({ className }: { className?: string }) => {
    return (
        <div
            className={cn(
                "absolute top-0 left-0 w-full h-full overflow-hidden bg-slate-950 flex flex-col items-center justify-center pointer-events-none",
                className
            )}
        >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-slate-950/0 z-20 [mask-image:linear-gradient(to_bottom,transparent,black)]" />
            <div className="absolute w-full h-full bg-slate-950 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
            <div className="absolute inset-0 z-0 opacity-30">
                <Beams />
            </div>
        </div>
    );
};

const Beams = () => {
    // Generate an array of beams with random properties
    const beams = new Array(8).fill(0).map((_, i) => ({
        initialX: Math.random() * 100,
        translateX: Math.random() * 200 - 100, // Move between -100 and 100
        duration: Math.random() * 10 + 10,
        repeatDelay: Math.random() * 10,
        delay: Math.random() * 5,
        width: Math.random() * 10 + 1, // Random width
    }));

    return (
        <svg
            className="absolute top-0 left-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {beams.map((beam, i) => (
                <motion.path
                    key={i}
                    d={`M${beam.initialX} -20 L${beam.initialX + beam.translateX} 120`}
                    stroke="url(#gradient-beam)"
                    strokeWidth={0.2} // Thinner, more elegant lines
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                        pathLength: [0, 1, 1, 0], // Draw, hold, erase
                        opacity: [0, 0.5, 0.5, 0],
                        pathOffset: [0, 0, 1, 1] // Move along the path
                    }}
                    transition={{
                        duration: beam.duration,
                        repeat: Infinity,
                        ease: "linear",
                        repeatDelay: beam.repeatDelay,
                        delay: beam.delay,
                    }}
                />
            ))}
            <defs>
                <linearGradient
                    id="gradient-beam"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#3b82f6" stopOpacity="0" />
                    <stop stopColor="#6366f1" stopOpacity="1" /> {/* Blue to Indigo */}
                    <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" /> {/* To Purple */}
                </linearGradient>
            </defs>
        </svg>
    );
};
