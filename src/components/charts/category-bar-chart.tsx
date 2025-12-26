'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

export interface CategoryData {
  name: string
  current: number
  previous?: number
  color: string
  change?: number
}

interface CategoryBarChartProps {
  data: CategoryData[]
  title?: string
  showComparison?: boolean
  className?: string
}

// Custom tooltip
function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload as CategoryData

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-xl">
      <p className="text-slate-900 dark:text-white font-medium mb-2">{label}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-600 dark:text-slate-300 text-sm">Current:</span>
          <span className="text-slate-900 dark:text-white font-medium">
            {formatCurrency(data.current)}
          </span>
        </div>
        {data.previous !== undefined && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500 dark:text-slate-400 text-sm">Previous:</span>
            <span className="text-slate-700 dark:text-slate-300">
              {formatCurrency(data.previous)}
            </span>
          </div>
        )}
        {data.change !== undefined && (
          <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400 text-sm">Change:</span>
            <span className={data.change >= 0 ? 'text-red-500' : 'text-emerald-500'}>
              {data.change >= 0 ? '+' : ''}
              {data.change.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export function CategoryBarChart({
  data,
  title = 'Category Spending',
  showComparison = false,
  className,
}: CategoryBarChartProps) {
  // Calculate changes
  const dataWithChanges = data.map((item) => ({
    ...item,
    change: item.previous ? ((item.current - item.previous) / item.previous) * 100 : undefined,
  }))

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {showComparison && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-muted-foreground">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-slate-400" />
              <span className="text-muted-foreground">Previous</span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dataWithChanges}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                opacity={0.3}
                horizontal={false}
              />
              <XAxis
                type="number"
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
              {showComparison && (
                <Bar
                  dataKey="previous"
                  fill="#94a3b8"
                  radius={[0, 4, 4, 0]}
                  barSize={12}
                  name="Previous"
                />
              )}
              <Bar
                dataKey="current"
                radius={[0, 4, 4, 0]}
                barSize={showComparison ? 12 : 20}
                name="Current"
              >
                {dataWithChanges.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// Sample data generator
export function generateSampleCategoryData(): CategoryData[] {
  return [
    { name: 'Payroll', current: 45000, previous: 42000, color: '#3B82F6' },
    { name: 'Infrastructure', current: 12000, previous: 10500, color: '#10B981' },
    { name: 'Marketing', current: 8000, previous: 9500, color: '#F59E0B' },
    { name: 'SaaS Tools', current: 5500, previous: 5200, color: '#8B5CF6' },
    { name: 'Office', current: 4000, previous: 4000, color: '#EC4899' },
    { name: 'Travel', current: 2500, previous: 3200, color: '#06B6D4' },
  ]
}
