'use client'

import { useMemo, useId } from 'react'

import { cn } from '@/lib/utils'

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  strokeWidth?: number
  className?: string
  gradientId?: string
  positive?: boolean
  showDot?: boolean
  animate?: boolean
}

export function Sparkline({
  data,
  width = 80,
  height = 24,
  strokeWidth = 1.5,
  className,
  gradientId,
  positive,
  showDot = true,
  animate = true,
}: SparklineProps) {
  const { path, dotPosition, isPositive, gradientColors } = useMemo(() => {
    if (!data || data.length < 2) {
      return {
        path: '',
        dotPosition: null,
        isPositive: true,
        gradientColors: { start: '#22c55e', end: '#16a34a' },
      }
    }

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1

    // Padding for the dot
    const padding = 2
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Calculate points
    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth
      const y = padding + chartHeight - ((value - min) / range) * chartHeight
      return { x, y }
    })

    // Create smooth curve path
    const pathData = points.reduce((acc, point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`
      }

      // Use quadratic bezier for smoother curves
      const prevPoint = points[index - 1]
      const cpX = (prevPoint.x + point.x) / 2
      return `${acc} Q ${cpX} ${prevPoint.y} ${point.x} ${point.y}`
    }, '')

    // Determine if trend is positive
    const trendIsPositive = positive ?? data[data.length - 1] >= data[0]

    // Last point for the dot
    const lastPoint = points[points.length - 1]

    return {
      path: pathData,
      dotPosition: lastPoint,
      isPositive: trendIsPositive,
      gradientColors: trendIsPositive
        ? { start: '#22c55e', end: '#16a34a' }
        : { start: '#ef4444', end: '#dc2626' },
    }
  }, [data, width, height, positive])

  const generatedId = useId()
  const uniqueGradientId = gradientId || `sparkline-gradient-${generatedId}`

  if (!data || data.length < 2) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={{ width, height }}>
        <div className="w-full h-px bg-muted-foreground/20" />
      </div>
    )
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('overflow-visible', className)}
    >
      {/* Gradient definition */}
      <defs>
        <linearGradient id={uniqueGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={gradientColors.start} stopOpacity={0.7} />
          <stop offset="100%" stopColor={gradientColors.end} />
        </linearGradient>
      </defs>

      {/* The sparkline path */}
      <path
        d={path}
        fill="none"
        stroke={`url(#${uniqueGradientId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(animate && 'animate-draw-line')}
        style={{
          strokeDasharray: animate ? 1000 : 'none',
          strokeDashoffset: animate ? 1000 : 0,
        }}
      />

      {/* End dot */}
      {showDot && dotPosition && (
        <g className={animate ? 'animate-fade-in-delayed' : ''}>
          {/* Outer glow */}
          <circle
            cx={dotPosition.x}
            cy={dotPosition.y}
            r={4}
            fill={gradientColors.end}
            opacity={0.3}
            className={cn(isPositive ? 'animate-pulse-soft' : 'animate-pulse')}
          />
          {/* Inner dot */}
          <circle
            cx={dotPosition.x}
            cy={dotPosition.y}
            r={2.5}
            fill={gradientColors.end}
            stroke="white"
            strokeWidth={1}
          />
        </g>
      )}
    </svg>
  )
}

// Mini sparkline bar chart variant
interface SparklineBarProps {
  data: number[]
  width?: number
  height?: number
  barWidth?: number
  gap?: number
  className?: string
  positive?: boolean
}

export function SparklineBar({
  data,
  width = 60,
  height = 20,
  barWidth = 3,
  gap = 2,
  className,
  positive,
}: SparklineBarProps) {
  const { bars, isPositive } = useMemo(() => {
    if (!data || data.length < 1) {
      return { bars: [], isPositive: true }
    }

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1

    const barsData = data.map((value, index) => {
      const normalizedHeight = ((value - min) / range) * (height - 4) + 4
      const x = index * (barWidth + gap)
      return {
        x,
        height: normalizedHeight,
        value,
        isLast: index === data.length - 1,
      }
    })

    const trendIsPositive = positive ?? data[data.length - 1] >= data[0]

    return { bars: barsData, isPositive: trendIsPositive }
  }, [data, height, barWidth, gap, positive])

  if (!data || data.length < 1) return null

  const color = isPositive ? '#22c55e' : '#ef4444'

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className}>
      {bars.map((bar, index) => (
        <rect
          key={index}
          x={bar.x}
          y={height - bar.height}
          width={barWidth}
          height={bar.height}
          rx={1}
          fill={bar.isLast ? color : `${color}40`}
          className="transition-all duration-300"
          style={{
            animationDelay: `${index * 50}ms`,
          }}
        />
      ))}
    </svg>
  )
}
