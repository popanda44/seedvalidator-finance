'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, TooltipProps } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

export interface ExpenseCategory {
  name: string
  value: number
  color: string
  icon?: string
  percentage?: number
}

interface ExpenseBreakdownChartProps {
  data: ExpenseCategory[]
  title?: string
  className?: string
}

// Custom tooltip component
function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload as ExpenseCategory

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-xl">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
        <span className="text-slate-900 dark:text-white font-medium">{data.name}</span>
      </div>
      <p className="text-slate-600 dark:text-slate-300 text-sm">{formatCurrency(data.value)}</p>
      {data.percentage && (
        <p className="text-slate-500 dark:text-slate-400 text-xs">
          {data.percentage.toFixed(1)}% of total
        </p>
      )}
    </div>
  )
}

// Custom legend component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomLegend({ payload }: any) {
  return (
    <div className="grid grid-cols-2 gap-2 mt-4">
      {payload.map(
        (entry: { color: string; value: string; payload: ExpenseCategory }, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-muted-foreground truncate">{entry.value}</span>
            <span className="text-sm font-medium text-slate-900 dark:text-white ml-auto">
              {formatCurrency(entry.payload.value)}
            </span>
          </div>
        )
      )}
    </div>
  )
}

export function ExpenseBreakdownChart({
  data,
  title = 'Expense Breakdown',
  className,
}: ExpenseBreakdownChartProps) {
  // Calculate percentages
  const totalExpenses = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data])
  const dataWithPercentages = useMemo(
    () =>
      data.map((item) => ({
        ...item,
        percentage: (item.value / totalExpenses) * 100,
      })),
    [data, totalExpenses]
  )

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <div className="text-sm text-muted-foreground">
          Total:{' '}
          <span className="font-medium text-slate-900 dark:text-white">
            {formatCurrency(totalExpenses)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataWithPercentages}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {dataWithPercentages.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// Sample data generator
export function generateSampleExpenseData(): ExpenseCategory[] {
  return [
    { name: 'Payroll', value: 45000, color: '#3B82F6' },
    { name: 'Infrastructure', value: 12000, color: '#10B981' },
    { name: 'Marketing', value: 8000, color: '#F59E0B' },
    { name: 'SaaS Tools', value: 5500, color: '#8B5CF6' },
    { name: 'Office', value: 4000, color: '#EC4899' },
    { name: 'Other', value: 3500, color: '#6B7280' },
  ]
}
