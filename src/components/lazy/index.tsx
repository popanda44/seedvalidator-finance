'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import { ComponentType, Suspense } from 'react'

// Loading placeholder component
const LoadingPlaceholder = ({ height = 'h-64' }: { height?: string }) => (
  <div
    className={`${height} w-full flex items-center justify-center bg-muted/20 rounded-xl animate-pulse`}
  >
    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
  </div>
)

// Chart loading placeholder
const ChartLoader = () => <LoadingPlaceholder height="h-80" />

// Card loading placeholder
const CardLoader = () => <LoadingPlaceholder height="h-32" />

// Modal loading placeholder
const ModalLoader = () => <LoadingPlaceholder height="h-96" />

// Lazy-loaded heavy components
export const LazyBurnTrendChart = dynamic(
  () => import('@/components/charts/burn-trend-chart').then((mod) => mod.BurnTrendChart),
  { loading: ChartLoader, ssr: false }
)

export const LazyCategoryBarChart = dynamic(
  () => import('@/components/charts/category-bar-chart').then((mod) => mod.CategoryBarChart),
  { loading: ChartLoader, ssr: false }
)

export const LazyExpenseBreakdownChart = dynamic(
  () =>
    import('@/components/charts/expense-breakdown-chart').then((mod) => mod.ExpenseBreakdownChart),
  { loading: ChartLoader, ssr: false }
)

export const LazyRevenueForecastChart = dynamic(
  () =>
    import('@/components/charts/revenue-forecast-chart').then((mod) => mod.RevenueForecastChart),
  { loading: ChartLoader, ssr: false }
)

export const LazyAIInsightsPanel = dynamic(
  () => import('@/components/ai/ai-insights-panel').then((mod) => mod.AIInsightsPanel),
  { loading: () => <LoadingPlaceholder height="h-48" />, ssr: false }
)

export const LazyOnboardingModal = dynamic(
  () => import('@/components/onboarding/onboarding-modal').then((mod) => mod.OnboardingModal),
  { loading: ModalLoader, ssr: false }
)

export const LazyScenarioBuilder = dynamic(
  () => import('@/components/forecasting/scenario-builder').then((mod) => mod.ScenarioBuilder),
  { loading: () => <LoadingPlaceholder height="h-64" />, ssr: false }
)

export const LazyPDFExporter = dynamic(
  () => import('@/components/export/pdf-exporter').then((mod) => mod.PDFExporter),
  { loading: CardLoader, ssr: false }
)

export const LazyRunwaySimulator = dynamic(
  () => import('@/components/marketing/runway-simulator').then((mod) => mod.RunwaySimulator),
  { loading: () => <LoadingPlaceholder height="h-96" />, ssr: false }
)

export const LazyFeatureShowcase = dynamic(
  () => import('@/components/marketing/feature-showcase').then((mod) => mod.FeatureShowcase),
  { loading: () => <LoadingPlaceholder height="h-64" />, ssr: false }
)

// Utility for wrapping any component with Suspense
export function withSuspense<P extends object>(
  Component: ComponentType<P>,
  fallback: React.ReactNode = <LoadingPlaceholder />
) {
  return function SuspenseWrapper(props: P) {
    return (
      <Suspense fallback={fallback}>
        <Component {...props} />
      </Suspense>
    )
  }
}

// Export loading components for custom use
export { LoadingPlaceholder, ChartLoader, CardLoader, ModalLoader }
