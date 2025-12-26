'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Sparkles, Brain, TrendingUp, AlertTriangle, Lightbulb, Zap } from 'lucide-react'

// ==========================================
// AI THINKING INDICATOR - Neural network animation
// ==========================================
interface AIThinkingProps {
  isThinking: boolean
  className?: string
}

export function AIThinking({ isThinking, className }: AIThinkingProps) {
  return (
    <AnimatePresence>
      {isThinking && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={cn('flex items-center gap-2', className)}
        >
          <div className="relative">
            {/* Neural network nodes */}
            <svg width="24" height="24" viewBox="0 0 24 24" className="text-emerald-400">
              {[
                { cx: 12, cy: 4 },
                { cx: 4, cy: 12 },
                { cx: 20, cy: 12 },
                { cx: 8, cy: 20 },
                { cx: 16, cy: 20 },
              ].map((pos, i) => (
                <motion.circle
                  key={i}
                  cx={pos.cx}
                  cy={pos.cy}
                  r="2"
                  fill="currentColor"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, delay: i * 0.15, repeat: Infinity }}
                />
              ))}
              {/* Connections */}
              <motion.path
                d="M12 4 L4 12 L8 20 M12 4 L20 12 L16 20 M8 20 L16 20"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
                strokeDasharray="4 4"
                animate={{ strokeDashoffset: [0, -8] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </svg>
          </div>
          <span className="text-sm text-slate-400 font-medium">Analyzing...</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ==========================================
// AI CONFIDENCE METER - Visual confidence display
// ==========================================
interface ConfidenceMeterProps {
  confidence: number // 0-100
  label?: string
  className?: string
}

export function ConfidenceMeter({ confidence, label, className }: ConfidenceMeterProps) {
  const getConfidenceColor = (value: number) => {
    if (value >= 80) return 'from-emerald-500 to-teal-500'
    if (value >= 60) return 'from-yellow-500 to-amber-500'
    return 'from-red-500 to-orange-500'
  }

  const getConfidenceLabel = (value: number) => {
    if (value >= 80) return 'High Confidence'
    if (value >= 60) return 'Moderate Confidence'
    return 'Low Confidence'
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">
          {label || getConfidenceLabel(confidence)}
        </span>
        <span className="text-xs text-white font-bold">{confidence}%</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full bg-gradient-to-r', getConfidenceColor(confidence))}
          initial={{ width: 0 }}
          animate={{ width: `${confidence}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

// ==========================================
// INSIGHT CARD - AI-generated insight display
// ==========================================
interface InsightCardProps {
  type: 'prediction' | 'warning' | 'opportunity' | 'tip'
  title: string
  description: string
  confidence?: number
  action?: string
  onAction?: () => void
  className?: string
}

export function InsightCard({
  type,
  title,
  description,
  confidence,
  action,
  onAction,
  className,
}: InsightCardProps) {
  const typeConfig = {
    prediction: {
      icon: TrendingUp,
      color: 'emerald',
      bgGradient: 'from-emerald-500/20 to-teal-500/10',
      borderColor: 'border-emerald-500/30',
      iconBg: 'bg-emerald-500/20',
    },
    warning: {
      icon: AlertTriangle,
      color: 'amber',
      bgGradient: 'from-amber-500/20 to-orange-500/10',
      borderColor: 'border-amber-500/30',
      iconBg: 'bg-amber-500/20',
    },
    opportunity: {
      icon: Lightbulb,
      color: 'blue',
      bgGradient: 'from-blue-500/20 to-cyan-500/10',
      borderColor: 'border-blue-500/30',
      iconBg: 'bg-blue-500/20',
    },
    tip: {
      icon: Zap,
      color: 'purple',
      bgGradient: 'from-purple-500/20 to-pink-500/10',
      borderColor: 'border-purple-500/30',
      iconBg: 'bg-purple-500/20',
    },
  }

  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        'relative overflow-hidden rounded-xl p-4',
        'bg-gradient-to-br backdrop-blur-xl',
        config.bgGradient,
        'border',
        config.borderColor,
        className
      )}
    >
      {/* Animated shimmer */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
      />

      <div className="relative z-10">
        <div className="flex items-start gap-3">
          <div className={cn('p-2 rounded-lg', config.iconBg)}>
            <Icon className={cn('w-4 h-4', `text-${config.color}-400`)} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3 h-3 text-slate-400" />
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                AI Insight
              </span>
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">{title}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{description}</p>

            {confidence !== undefined && (
              <div className="mt-3">
                <ConfidenceMeter confidence={confidence} />
              </div>
            )}

            {action && (
              <button
                onClick={onAction}
                className={cn(
                  'mt-3 text-xs font-medium px-3 py-1.5 rounded-lg',
                  'bg-white/10 hover:bg-white/20 transition-colors',
                  `text-${config.color}-400`
                )}
              >
                {action} →
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ==========================================
// ANOMALY DETECTOR - Visual anomaly highlight
// ==========================================
interface AnomalyHighlightProps {
  severity: 'low' | 'medium' | 'high'
  children: React.ReactNode
  className?: string
}

export function AnomalyHighlight({ severity, children, className }: AnomalyHighlightProps) {
  const severityConfig = {
    low: 'ring-yellow-500/30 shadow-yellow-500/10',
    medium: 'ring-orange-500/50 shadow-orange-500/20',
    high: 'ring-red-500/70 shadow-red-500/30 animate-pulse',
  }

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn('relative rounded-lg ring-2', severityConfig[severity], 'shadow-lg', className)}
    >
      {/* Anomaly indicator badge */}
      <div className="absolute -top-2 -right-2 z-10">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className={cn(
            'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
            severity === 'high' && 'bg-red-500 text-white',
            severity === 'medium' && 'bg-orange-500 text-white',
            severity === 'low' && 'bg-yellow-500 text-black'
          )}
        >
          !
        </motion.div>
      </div>
      {children}
    </motion.div>
  )
}

// ==========================================
// PREDICTIVE TREND - Future projection visual
// ==========================================
interface PredictiveTrendProps {
  historicalData: number[]
  predictedData: number[]
  className?: string
}

export function PredictiveTrend({
  historicalData,
  predictedData,
  className,
}: PredictiveTrendProps) {
  const allData = [...historicalData, ...predictedData]
  const max = Math.max(...allData)
  const min = Math.min(...allData)
  const range = max - min || 1

  const width = 200
  const height = 60
  const historicalWidth = (historicalData.length / allData.length) * width

  const getY = (value: number) => height - ((value - min) / range) * height

  const historicalPoints = historicalData
    .map((v, i) => {
      const x = (i / (historicalData.length - 1)) * historicalWidth
      return `${x},${getY(v)}`
    })
    .join(' ')

  const predictedPoints = predictedData.map((v, i) => {
    const x = historicalWidth + ((i + 1) / predictedData.length) * (width - historicalWidth)
    return `${x},${getY(v)}`
  })

  const fullPredictedPath = `${historicalWidth},${getY(historicalData[historicalData.length - 1])} ${predictedPoints.join(' ')}`

  return (
    <div className={cn('relative', className)}>
      <svg width={width} height={height} className="overflow-visible">
        {/* Historical line (solid) */}
        <polyline
          points={historicalPoints}
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Predicted line (dashed) */}
        <motion.polyline
          points={fullPredictedPath}
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeDasharray="4 4"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />
        {/* Divider line */}
        <line
          x1={historicalWidth}
          y1="0"
          x2={historicalWidth}
          y2={height}
          stroke="#374151"
          strokeWidth="1"
          strokeDasharray="2 2"
        />
      </svg>
      {/* Labels */}
      <div className="flex justify-between mt-2 text-[10px] text-slate-500">
        <span>Historical</span>
        <span className="text-emerald-400">Predicted</span>
      </div>
    </div>
  )
}
