/**
 * AI-Powered Financial Insights Service
 * Uses OpenAI to generate actionable financial recommendations
 */

import OpenAI from 'openai'

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

export interface FinancialMetrics {
  cashBalance: number
  burnRate: number
  runway: number
  mrr: number
  mrrGrowth: number
  expenses: { category: string; amount: number; change: number }[]
  recentTransactions?: { name: string; amount: number; category: string }[]
}

export interface AIInsight {
  id: string
  type: 'recommendation' | 'warning' | 'opportunity' | 'anomaly'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: string
  actionable: boolean
  suggestedAction?: string
}

export interface AIInsightsResponse {
  insights: AIInsight[]
  summary: string
  generatedAt: string
  model: string
}

const SYSTEM_PROMPT = `You are a financial advisor AI for startup companies. Analyze the provided financial metrics and generate actionable insights.

Your insights should be:
1. Specific and data-driven
2. Actionable with clear next steps
3. Prioritized by impact and urgency
4. Written in a professional but accessible tone

Categories for insights:
- Cash Management: runway, burn rate, cash flow
- Revenue: MRR growth, revenue optimization
- Expenses: cost reduction, efficiency
- Forecasting: projections, trends
- Risk: warnings about potential issues

Always provide 4-6 insights with varying priorities.`

export async function generateAIInsights(metrics: FinancialMetrics): Promise<AIInsightsResponse> {
  if (!openai) {
    console.warn('OpenAI not configured, returning demo insights')
    return getDemoInsights(metrics)
  }

  try {
    const userPrompt = `Analyze these financial metrics for a startup and provide insights:

Cash Balance: $${metrics.cashBalance.toLocaleString()}
Monthly Burn Rate: $${metrics.burnRate.toLocaleString()}
Runway: ${metrics.runway.toFixed(1)} months
MRR: $${metrics.mrr.toLocaleString()}
MRR Growth: ${metrics.mrrGrowth}%

Top Expenses:
${metrics.expenses.map((e) => `- ${e.category}: $${e.amount.toLocaleString()} (${e.change > 0 ? '+' : ''}${e.change}% change)`).join('\n')}

Provide insights in the following JSON format:
{
  "insights": [
    {
      "type": "recommendation|warning|opportunity|anomaly",
      "title": "Brief title",
      "description": "Detailed explanation",
      "priority": "high|medium|low",
      "category": "Cash Management|Revenue|Expenses|Forecasting|Risk",
      "actionable": true,
      "suggestedAction": "Specific action to take"
    }
  ],
  "summary": "2-3 sentence executive summary of the financial health"
}`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    const parsed = JSON.parse(content)

    return {
      insights: parsed.insights.map((insight: AIInsight, index: number) => ({
        ...insight,
        id: `ai-${Date.now()}-${index}`,
      })),
      summary: parsed.summary,
      generatedAt: new Date().toISOString(),
      model: 'gpt-4o-mini',
    }
  } catch (error) {
    console.error('AI Insights error:', error)
    return getDemoInsights(metrics)
  }
}

// Generate insights for anomaly detection
export async function detectAnomalies(
  currentMetrics: FinancialMetrics,
  historicalAvg: FinancialMetrics
): Promise<AIInsight[]> {
  const anomalies: AIInsight[] = []

  // Check for significant deviations
  const burnChange =
    ((currentMetrics.burnRate - historicalAvg.burnRate) / historicalAvg.burnRate) * 100
  if (Math.abs(burnChange) > 20) {
    anomalies.push({
      id: `anomaly-burn-${Date.now()}`,
      type: 'anomaly',
      title: burnChange > 0 ? 'Burn Rate Spike Detected' : 'Burn Rate Decrease',
      description: `Your burn rate is ${Math.abs(burnChange).toFixed(0)}% ${burnChange > 0 ? 'higher' : 'lower'} than usual.`,
      priority: burnChange > 0 ? 'high' : 'medium',
      category: 'Cash Management',
      actionable: true,
      suggestedAction:
        burnChange > 0
          ? 'Review recent expenses and identify unexpected costs'
          : 'Great work! Document what contributed to this reduction',
    })
  }

  // Check expenses for anomalies
  currentMetrics.expenses.forEach((expense) => {
    if (Math.abs(expense.change) > 50) {
      anomalies.push({
        id: `anomaly-expense-${expense.category}-${Date.now()}`,
        type: 'anomaly',
        title: `${expense.category} ${expense.change > 0 ? 'Spending Surge' : 'Cost Reduction'}`,
        description: `${expense.category} expenses changed by ${expense.change > 0 ? '+' : ''}${expense.change}%`,
        priority: expense.change > 50 ? 'high' : 'medium',
        category: 'Expenses',
        actionable: true,
        suggestedAction:
          expense.change > 0
            ? `Review ${expense.category} transactions for unusual charges`
            : `Analyze what drove the savings in ${expense.category}`,
      })
    }
  })

  return anomalies
}

// Demo insights when OpenAI is not configured
function getDemoInsights(metrics: FinancialMetrics): AIInsightsResponse {
  const insights: AIInsight[] = []

  // Runway-based insights
  if (metrics.runway < 6) {
    insights.push({
      id: 'demo-1',
      type: 'warning',
      title: 'Critical Runway Alert',
      description: `With only ${metrics.runway.toFixed(1)} months of runway remaining, immediate action is needed to extend your financial runway.`,
      priority: 'high',
      category: 'Cash Management',
      actionable: true,
      suggestedAction:
        'Consider reducing non-essential expenses by 20% and accelerate fundraising efforts.',
    })
  } else if (metrics.runway < 12) {
    insights.push({
      id: 'demo-2',
      type: 'recommendation',
      title: 'Plan for Runway Extension',
      description: `Your ${metrics.runway.toFixed(1)} month runway gives you time to plan strategically. Start fundraising conversations now.`,
      priority: 'medium',
      category: 'Cash Management',
      actionable: true,
      suggestedAction: 'Begin investor outreach 6 months before you need funds.',
    })
  }

  // MRR growth insights
  if (metrics.mrrGrowth > 10) {
    insights.push({
      id: 'demo-3',
      type: 'opportunity',
      title: 'Strong Revenue Growth',
      description: `Your MRR growth of ${metrics.mrrGrowth}% is excellent. Consider investing in what\'s working.`,
      priority: 'medium',
      category: 'Revenue',
      actionable: true,
      suggestedAction: 'Analyze top-performing acquisition channels and double down on them.',
    })
  } else if (metrics.mrrGrowth < 5) {
    insights.push({
      id: 'demo-4',
      type: 'recommendation',
      title: 'Revenue Growth Opportunity',
      description: 'MRR growth has slowed. Focus on customer expansion and reducing churn.',
      priority: 'high',
      category: 'Revenue',
      actionable: true,
      suggestedAction: 'Implement a customer success program to improve retention.',
    })
  }

  // Expense analysis
  const highestExpense = metrics.expenses.reduce((a, b) => (a.amount > b.amount ? a : b))
  insights.push({
    id: 'demo-5',
    type: 'recommendation',
    title: `Optimize ${highestExpense.category} Spending`,
    description: `${highestExpense.category} is your largest expense at $${highestExpense.amount.toLocaleString()}. Review for optimization opportunities.`,
    priority: 'low',
    category: 'Expenses',
    actionable: true,
    suggestedAction: `Audit ${highestExpense.category} contracts for potential savings.`,
  })

  // General forecast insight
  insights.push({
    id: 'demo-6',
    type: 'recommendation',
    title: 'Scenario Planning Recommended',
    description: 'Create multiple financial scenarios to prepare for different market conditions.',
    priority: 'low',
    category: 'Forecasting',
    actionable: true,
    suggestedAction: 'Model conservative, base, and optimistic scenarios for the next 12 months.',
  })

  return {
    insights,
    summary: `Your company has ${metrics.runway.toFixed(1)} months of runway with $${(metrics.mrr / 1000).toFixed(0)}K MRR growing at ${metrics.mrrGrowth}%. ${metrics.runway < 9 ? 'Consider extending runway through cost optimization or fundraising.' : 'Financial health is stable.'}`,
    generatedAt: new Date().toISOString(),
    model: 'demo',
  }
}

export { getDemoInsights }
