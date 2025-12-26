"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "absolute h-full w-full inset-0 overflow-hidden bg-background",
        className
      )}
    >
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent dark:from-white/5" />
      <div className="h-full w-full absolute inset-0 z-10 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <Beam key={i} />
        ))}
      </div>
    </div>
  );
};

const Beam = () => {
  const [beamData, setBeamData] = useState<{
    initialX: number;
    initialY: number;
    initialRotate: number;
    targetX: number;
    targetY: number;
    targetRotate: number;
    duration: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBeamData({
        initialX: Math.random() * window.innerWidth,
        initialY: Math.random() * window.innerHeight,
        initialRotate: Math.random() * 360,
        targetX: Math.random() * window.innerWidth,
        targetY: Math.random() * window.innerHeight,
        targetRotate: Math.random() * 360,
        duration: 20 + Math.random() * 20,
        width: Math.random() * 20 + 20,
      });
    }
  }, []);

  if (!beamData) return null;

  return (
    <motion.div
      initial={{
        x: beamData.initialX,
        y: beamData.initialY,
        rotate: beamData.initialRotate,
      }}
      animate={{
        x: beamData.targetX,
        y: beamData.targetY,
        rotate: beamData.targetRotate,
      }}
      transition={{
        duration: beamData.duration,
        repeat: Infinity,
        ease: "linear",
      }}
      className={cn(
        "absolute h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent",
        "blur-[2px]"
      )}
      style={{
        opacity: 0.05,
        width: `${beamData.width}rem`,
      }}
    />
  );
};
