import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency amount
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options,
  }).format(amount)
}

/**
 * Format currency with sign
 */
export function formatCurrencyWithSign(amount: number, currency: string = 'USD'): string {
  const prefix = amount >= 0 ? '+' : ''
  return prefix + formatCurrency(amount, currency)
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    ...options,
  }).format(value / 100)
}

/**
 * Format number with abbreviation (K, M, B)
 */
export function formatCompactNumber(num: number): string {
  const formatter = Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  })
  return formatter.format(num)
}

/**
 * Format runway in months
 */
export function formatRunway(months: number): string {
  if (months < 0) return 'Negative'
  if (months < 1) return `${Math.round(months * 30)} days`
  if (months >= 24) return '24+ months'
  return `${months.toFixed(1)} months`
}

/**
 * Get runway status and color
 */
export function getRunwayStatus(months: number): {
  status: 'critical' | 'warning' | 'caution' | 'healthy'
  label: string
  color: string
} {
  if (months < 6) {
    return { status: 'critical', label: 'Critical', color: 'text-red-500' }
  }
  if (months < 9) {
    return { status: 'warning', label: 'Warning', color: 'text-orange-500' }
  }
  if (months < 12) {
    return { status: 'caution', label: 'Caution', color: 'text-yellow-500' }
  }
  return { status: 'healthy', label: 'Healthy', color: 'text-green-500' }
}

/**
 * Format date
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }).format(d)
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return formatDate(d)
}

/**
 * Calculate month-over-month change
 */
export function calculateMoMChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / Math.abs(previous)) * 100
}

/**
 * Calculate runway in months
 */
export function calculateRunway(cashBalance: number, averageMonthlyBurn: number): number {
  if (averageMonthlyBurn <= 0) return 99 // Effectively infinite if not burning
  return cashBalance / averageMonthlyBurn
}

/**
 * Calculate burn rate from transactions
 */
export function calculateBurnRate(
  expenses: number,
  revenue: number = 0,
  type: 'gross' | 'net' = 'net'
): number {
  if (type === 'gross') return expenses
  return expenses - revenue
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Generate a random color for categories
 */
export function generateCategoryColor(): string {
  const colors = [
    '#3B82F6', // blue
    '#10B981', // emerald
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#F97316', // orange
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}
