'use client'

import { ReactNode, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

// ==========================================
// LIQUID GLASS CARD - Flowing edge effect
// ==========================================
interface LiquidGlassCardProps {
  children: ReactNode
  className?: string
}

export function LiquidGlassCard({ children, className }: LiquidGlassCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      ref={ref}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'bg-white/10 dark:bg-white/5',
        'backdrop-blur-xl backdrop-saturate-150',
        'border border-white/20 dark:border-white/10',
        'shadow-[0_8px_32px_rgba(0,0,0,0.12)]',
        'transition-all duration-500',
        className
      )}
    >
      {/* Liquid edge animation */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: isHovered
            ? 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(16, 185, 129, 0.15) 0%, transparent 50%)'
            : 'none',
        }}
      />

      {/* Animated border glow */}
      <motion.div
        className="absolute -inset-[1px] rounded-2xl opacity-0 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, #10b981, #14b8a6, #06b6d4, #10b981)',
          backgroundSize: '300% 100%',
        }}
        animate={{
          opacity: isHovered ? 0.5 : 0,
          backgroundPosition: isHovered ? ['0% 50%', '100% 50%'] : '0% 50%',
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />

      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

// ==========================================
// HOLOGRAPHIC CARD - Prismatic rainbow effect
// ==========================================
interface HolographicCardProps {
  children: ReactNode
  className?: string
  intensity?: 'low' | 'medium' | 'high'
}

export function HolographicCard({
  children,
  className,
  intensity = 'medium',
}: HolographicCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const springConfig = { stiffness: 150, damping: 15 }
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [8, -8]), springConfig)
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-8, 8]), springConfig)

  const intensityValues = {
    low: 0.3,
    medium: 0.5,
    high: 0.8,
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width)
    mouseY.set((e.clientY - rect.top) / rect.height)
  }

  const handleMouseLeave = () => {
    mouseX.set(0.5)
    mouseY.set(0.5)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={cn(
        'relative overflow-hidden rounded-2xl cursor-pointer',
        'bg-gradient-to-br from-slate-900/90 to-slate-800/90',
        'border border-white/10',
        'shadow-2xl',
        className
      )}
    >
      {/* Holographic overlay - Prismatic effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none mix-blend-overlay"
        style={{
          background: `
            linear-gradient(
              ${useTransform(mouseX, [0, 1], [0, 360])}deg,
              rgba(255, 0, 128, ${intensityValues[intensity]}) 0%,
              rgba(0, 255, 255, ${intensityValues[intensity]}) 25%,
              rgba(255, 255, 0, ${intensityValues[intensity]}) 50%,
              rgba(0, 128, 255, ${intensityValues[intensity]}) 75%,
              rgba(255, 0, 128, ${intensityValues[intensity]}) 100%
            )
          `,
          opacity: 0.4,
        }}
      />

      {/* Noise texture for authenticity */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

// ==========================================
// AURORA CARD - Northern lights effect
// ==========================================
interface AuroraCardProps {
  children: ReactNode
  className?: string
}

export function AuroraCard({ children, className }: AuroraCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'bg-slate-950/80 backdrop-blur-xl',
        'border border-white/10',
        className
      )}
    >
      {/* Aurora effect layers */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -inset-[100%] opacity-30"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% 50%, #22c55e, transparent)',
          }}
          animate={{
            x: ['-20%', '20%', '-20%'],
            y: ['-10%', '10%', '-10%'],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -inset-[100%] opacity-25"
          style={{
            background: 'radial-gradient(ellipse 60% 40% at 30% 60%, #06b6d4, transparent)',
          }}
          animate={{
            x: ['10%', '-10%', '10%'],
            y: ['5%', '-5%', '5%'],
            scale: [1.1, 1, 1.1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute -inset-[100%] opacity-20"
          style={{
            background: 'radial-gradient(ellipse 50% 30% at 70% 40%, #a855f7, transparent)',
          }}
          animate={{
            x: ['-15%', '15%', '-15%'],
            y: ['8%', '-8%', '8%'],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  )
}

// ==========================================
// METRIC GLASS CARD - For dashboard metrics
// ==========================================
interface MetricGlassCardProps {
  title: string
  value: string | number
  change?: number
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}

export function MetricGlassCard({
  title,
  value,
  change,
  icon,
  trend = 'neutral',
  className,
}: MetricGlassCardProps) {
  const trendColors = {
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-slate-400',
  }

  return (
    <LiquidGlassCard className={cn('p-5', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {change !== undefined && (
            <p className={cn('text-sm font-medium mt-1', trendColors[trend])}>
              {trend === 'up' && '↑'}
              {trend === 'down' && '↓'}
              {change > 0 ? '+' : ''}
              {change}%
            </p>
          )}
        </div>
        {icon && <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">{icon}</div>}
      </div>
    </LiquidGlassCard>
  )
}

// ==========================================
// DEPTH CARD - 3D parallax effect
// ==========================================
interface DepthCardProps {
  children: ReactNode
  className?: string
  depth?: number
}

export function DepthCard({ children, className, depth = 20 }: DepthCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { stiffness: 300, damping: 30 }
  const x = useSpring(mouseX, springConfig)
  const y = useSpring(mouseY, springConfig)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    mouseX.set((e.clientX - centerX) / depth)
    mouseY.set((e.clientY - centerY) / depth)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      className={cn(
        'relative rounded-2xl',
        'bg-gradient-to-br from-white/10 to-white/5 dark:from-white/5 dark:to-white/[0.02]',
        'backdrop-blur-xl border border-white/20',
        'shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)]',
        'transition-shadow duration-300',
        'hover:shadow-[0_25px_60px_-15px_rgba(16,185,129,0.25)]',
        className
      )}
    >
      {children}
    </motion.div>
  )
}

export { LiquidGlassCard as GlassCard }
