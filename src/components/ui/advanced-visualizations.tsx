'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion'
import { cn } from '@/lib/utils'

// ==========================================
// ANIMATED GAUGE - Radial progress with glow
// ==========================================
interface AnimatedGaugeProps {
  value: number // 0-100
  label: string
  sublabel?: string
  size?: number
  color?: string
  className?: string
}

export function AnimatedGauge({
  value,
  label,
  sublabel,
  size = 160,
  color = '#10b981',
  className,
}: AnimatedGaugeProps) {
  const spring = useSpring(0, { stiffness: 50, damping: 15 })
  const displayValue = useTransform(spring, (v) => Math.round(v))

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  const circumference = (size - 20) * Math.PI
  const strokeDashoffset = useTransform(spring, (v) => circumference - (v / 100) * circumference)

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size - 20) / 2}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-slate-800"
        />
        {/* Animated progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={(size - 20) / 2}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset }}
          className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="text-3xl font-bold text-white">{displayValue}</motion.span>
        <span className="text-xs text-slate-400 font-medium">{label}</span>
        {sublabel && <span className="text-[10px] text-slate-500">{sublabel}</span>}
      </div>
    </div>
  )
}

// ==========================================
// PARTICLE TREND INDICATOR - Flowing particles
// ==========================================
interface ParticleTrendProps {
  trend: 'up' | 'down' | 'stable'
  intensity?: number
  className?: string
}

export function ParticleTrend({ trend, intensity = 5, className }: ParticleTrendProps) {
  const particles = Array.from({ length: intensity }, (_, i) => i)

  const colors = {
    up: '#22c55e',
    down: '#ef4444',
    stable: '#6b7280',
  }

  return (
    <div className={cn('relative h-12 w-20 overflow-hidden', className)}>
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: colors[trend] }}
          initial={{
            x: Math.random() * 80,
            y: trend === 'up' ? 48 : trend === 'down' ? 0 : 24,
            opacity: 0,
          }}
          animate={{
            y: trend === 'up' ? 0 : trend === 'down' ? 48 : [20, 28, 20],
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: 'easeOut',
          }}
        />
      ))}
      {/* Trend arrow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ y: trend === 'stable' ? 0 : trend === 'up' ? -2 : 2 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          className={cn(
            'text-lg font-bold',
            trend === 'up' && 'text-emerald-400',
            trend === 'down' && 'text-red-400',
            trend === 'stable' && 'text-slate-400'
          )}
        >
          {trend === 'up' && '↑'}
          {trend === 'down' && '↓'}
          {trend === 'stable' && '→'}
        </motion.div>
      </div>
    </div>
  )
}

// ==========================================
// PULSE RING - Animated status indicator
// ==========================================
interface PulseRingProps {
  status: 'healthy' | 'warning' | 'critical' | 'loading'
  size?: number
  className?: string
}

export function PulseRing({ status, size = 48, className }: PulseRingProps) {
  const statusConfig = {
    healthy: { color: '#22c55e', pulseColor: 'rgba(34, 197, 94, 0.4)' },
    warning: { color: '#f59e0b', pulseColor: 'rgba(245, 158, 11, 0.4)' },
    critical: { color: '#ef4444', pulseColor: 'rgba(239, 68, 68, 0.4)' },
    loading: { color: '#6366f1', pulseColor: 'rgba(99, 102, 241, 0.4)' },
  }

  const config = statusConfig[status]

  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      {/* Outer pulse rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: config.pulseColor }}
          initial={{ scale: 0.5, opacity: 0.8 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.6,
            ease: 'easeOut',
          }}
        />
      ))}
      {/* Center dot */}
      <div
        className="absolute inset-0 m-auto rounded-full shadow-lg"
        style={{
          width: size * 0.4,
          height: size * 0.4,
          backgroundColor: config.color,
          boxShadow: `0 0 20px ${config.color}`,
        }}
      />
    </div>
  )
}

// ==========================================
// DATA STREAM - Real-time data animation
// ==========================================
interface DataStreamProps {
  data: number[]
  height?: number
  className?: string
}

export function DataStream({ data, height = 60, className }: DataStreamProps) {
  const max = Math.max(...data, 1)

  return (
    <div className={cn('flex items-end gap-0.5', className)} style={{ height }}>
      {data.map((value, i) => (
        <motion.div
          key={i}
          className="flex-1 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t opacity-80"
          initial={{ height: 0 }}
          animate={{ height: `${(value / max) * 100}%` }}
          transition={{ duration: 0.5, delay: i * 0.02 }}
        />
      ))}
    </div>
  )
}

// ==========================================
// GLOW LINE CHART - Neon effect chart
// ==========================================
interface GlowLineChartProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  className?: string
}

export function GlowLineChart({
  data,
  width = 200,
  height = 80,
  color = '#10b981',
  className,
}: GlowLineChartProps) {
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1

  const points = data
    .map((value, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((value - min) / range) * height
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg width={width} height={height} className={cn('overflow-visible', className)}>
      {/* Glow filter */}
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.5" />
          <stop offset="50%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.5" />
        </linearGradient>
      </defs>
      {/* Line */}
      <motion.polyline
        points={points}
        fill="none"
        stroke="url(#lineGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />
      {/* Dots */}
      {data.map((value, i) => {
        const x = (i / (data.length - 1)) * width
        const y = height - ((value - min) / range) * height
        return (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r="3"
            fill={color}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: (i / data.length) * 1.5 + 0.5 }}
            className="drop-shadow-[0_0_4px_rgba(16,185,129,0.8)]"
          />
        )
      })}
    </svg>
  )
}

// ==========================================
// INTERACTIVE TOOLTIP - Smart positioning
// ==========================================
interface SmartTooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function SmartTooltip({ content, children, className }: SmartTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top - 40,
      })
    }
  }

  return (
    <div
      ref={ref}
      className={cn('relative', className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onMouseMove={handleMouseMove}
    >
      {children}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 5 }}
        animate={{
          opacity: isVisible ? 1 : 0,
          scale: isVisible ? 1 : 0.9,
          y: isVisible ? 0 : 5,
        }}
        className="absolute z-50 px-3 py-2 text-xs font-medium text-white bg-slate-900/95 backdrop-blur-sm rounded-lg border border-white/10 shadow-xl pointer-events-none whitespace-nowrap"
        style={{ left: position.x, top: position.y, transform: 'translateX(-50%)' }}
      >
        {content}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-slate-900/95 border-r border-b border-white/10" />
      </motion.div>
    </div>
  )
}
