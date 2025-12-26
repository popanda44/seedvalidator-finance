'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Slider } from '@/components/ui/slider'

export const RunwaySimulator = () => {
  const [cash, setCash] = useState(500000)
  const [burn, setBurn] = useState(25000)
  const runway = Math.floor(cash / burn)
  const [data, setData] = useState<number[]>([])

  // Generate sparkline data
  useEffect(() => {
    const months = Math.min(runway, 24)
    const newData = []
    let currentCash = cash
    for (let i = 0; i <= months; i++) {
      newData.push(currentCash)
      currentCash -= burn
    }
    setData(newData)
  }, [cash, burn, runway])

  return (
    <div className="w-full max-w-2xl mx-auto p-1 relative z-20">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-3xl blur-3xl opacity-20" />

      <div className="relative bg-card/50 dark:bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-lg font-medium text-foreground">Runway Simulator</h3>
            <p className="text-sm text-muted-foreground mt-1">Project your financial lifespan</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-light tracking-tight text-foreground tabular-nums">
              {runway} <span className="text-lg font-normal text-muted-foreground">months</span>
            </div>
            <div
              className={cn(
                'inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium border',
                runway > 12
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : runway > 6
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
              )}
            >
              {runway > 12 ? 'Healthy' : runway > 6 ? 'Caution' : 'Critical'}
            </div>
          </div>
        </div>

        {/* Chart Visualization */}
        <div className="h-32 w-full mb-8 flex items-end justify-between gap-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
          {/* Simple Line Chart visualization */}
          <svg
            className="w-full h-full absolute inset-0 text-indigo-500/50"
            viewBox={`0 0 ${data.length} 100`}
            preserveAspectRatio="none"
          >
            <path
              d={`M0,${100 - (data[0] / 500000) * 100} ${data.map((val, i) => `L${i},${100 - (val / 500000) * 100}`).join(' ')}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={`M0,${100 - (data[0] / 500000) * 100} ${data.map((val, i) => `L${i},${100 - (val / 500000) * 100}`).join(' ')} L${data.length},100 L0,100 Z`}
              fill="url(#gradient)"
              opacity="0.2"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="currentColor" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Cash on Hand</label>
              <span className="text-sm tabular-nums font-mono text-muted-foreground">
                ${cash.toLocaleString()}
              </span>
            </div>
            <Slider
              value={[cash]}
              min={0}
              max={1000000}
              step={10000}
              onValueChange={(val) => setCash(val[0])}
              className="cursor-pointer"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Monthly Burn</label>
              <span className="text-sm tabular-nums font-mono text-muted-foreground">
                ${burn.toLocaleString()}
              </span>
            </div>
            <Slider
              value={[burn]}
              min={1000}
              max={100000}
              step={1000}
              onValueChange={(val) => setBurn(val[0])}
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
