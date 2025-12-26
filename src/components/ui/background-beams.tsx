'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export const BackgroundBeams = ({ className }: { className?: string }) => {
  return (
    <div className={cn('absolute h-full w-full inset-0 overflow-hidden bg-background', className)}>
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent dark:from-white/5" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="h-full w-full absolute inset-0 z-10 pointer-events-none"
      >
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
              rotate: Math.random() * 360,
            }}
            animate={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
              rotate: Math.random() * 360,
            }}
            transition={{
              duration: 20 + Math.random() * 20,
              repeat: Infinity,
              ease: 'linear',
            }}
            className={cn(
              'absolute w-[40rem] h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent',
              'blur-[2px]'
            )}
            style={{
              opacity: 0.05,
              width: `${Math.random() * 20 + 20}rem`,
            }}
          />
        ))}
      </motion.div>
    </div>
  )
}
