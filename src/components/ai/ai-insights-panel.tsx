'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Sparkles,
  Loader2,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  Send,
  MessageCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Insight {
  type: 'warning' | 'opportunity' | 'recommendation'
  title: string
  description: string
}

interface AIInsightsData {
  summary: string
  insights: Insight[]
  healthScore: number
  isDemo?: boolean
}

export function AIInsightsPanel() {
  const [insights, setInsights] = useState<AIInsightsData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<string | null>(null)
  const [isAsking, setIsAsking] = useState(false)

  const fetchInsights = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/insights')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load insights')
      }

      setInsights(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const askQuestion = async () => {
    if (!question.trim()) return

    setIsAsking(true)
    setAnswer(null)

    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process question')
      }

      setAnswer(data.answer)
    } catch (err: any) {
      setAnswer("Sorry, I couldn't process that question.")
    } finally {
      setIsAsking(false)
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />
      case 'opportunity':
        return <TrendingUp className="w-4 h-4 text-emerald-500" />
      case 'recommendation':
        return <Lightbulb className="w-4 h-4 text-blue-500" />
      default:
        return <Sparkles className="w-4 h-4 text-purple-500" />
    }
  }

  const getHealthColor = (score: number) => {
    if (score >= 70) return 'text-emerald-500'
    if (score >= 40) return 'text-amber-500'
    return 'text-red-500'
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          AI Financial Insights
        </CardTitle>
        {!insights && (
          <Button onClick={fetchInsights} disabled={isLoading} variant="gradient" size="sm">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Insights
              </>
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {insights && (
          <>
            {/* Health Score */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/50 dark:bg-slate-800/50">
              <div>
                <p className="text-sm text-muted-foreground">Financial Health Score</p>
                <p className={cn('text-3xl font-bold', getHealthColor(insights.healthScore))}>
                  {insights.healthScore}/100
                </p>
              </div>
              <div
                className="w-16 h-16 rounded-full border-4 border-current flex items-center justify-center"
                style={{
                  borderColor:
                    insights.healthScore >= 70
                      ? '#10b981'
                      : insights.healthScore >= 40
                        ? '#f59e0b'
                        : '#ef4444',
                }}
              >
                <span className={cn('text-lg font-bold', getHealthColor(insights.healthScore))}>
                  {insights.healthScore >= 70 ? '👍' : insights.healthScore >= 40 ? '📊' : '⚠️'}
                </span>
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 rounded-lg bg-white/50 dark:bg-slate-800/50">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {insights.summary}
              </p>
            </div>

            {/* Insights List */}
            <div className="space-y-2">
              {insights.insights.map((insight, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
                    <div>
                      <p className="font-medium text-sm text-slate-900 dark:text-white">
                        {insight.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Ask a Question */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Ask AI</span>
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g., Why did my burn rate increase?"
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  onKeyDown={(e) => e.key === 'Enter' && askQuestion()}
                />
                <Button onClick={askQuestion} disabled={isAsking || !question.trim()} size="sm">
                  {isAsking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {answer && (
                <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm">
                  {answer}
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <Button
              onClick={fetchInsights}
              variant="outline"
              size="sm"
              className="w-full"
              disabled={isLoading}
            >
              Refresh Insights
            </Button>
          </>
        )}

        {!insights && !isLoading && !error && (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 mx-auto text-purple-300 dark:text-purple-600 mb-4" />
            <p className="text-muted-foreground">
              Click "Generate Insights" to get AI-powered financial analysis
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
