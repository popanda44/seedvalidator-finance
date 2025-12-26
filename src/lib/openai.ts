import OpenAI from 'openai'

// Lazy initialization to prevent build-time errors
let _openai: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return _openai
}

// ==========================================
// TYPE DEFINITIONS
// ==========================================
export interface FinancialData {
  cashBalance: number
  burnRate: number
  runway: number
  mrr?: number
  revenueGrowthMoM?: number
  headcount?: number
  topExpenseCategory?: string
  topExpenseAmount?: number
  recentTransactions?: Array<{ description: string; amount: number; category: string }>
}

export interface CFOBriefing {
  executiveSummary: string
  actionItems: Array<{
    priority: 'high' | 'medium' | 'low'
    action: string
    expectedImpact: string
    timeframe: string
  }>
  risksToMonitor: Array<{
    risk: string
    severity: 'critical' | 'warning' | 'info'
    mitigation: string
  }>
  metrics: {
    runwayStatus: 'healthy' | 'warning' | 'critical'
    burnEfficiency: string
    growthTrajectory: string
  }
}

export interface AlertExplanation {
  headline: string
  rootCause: string
  impact: string
  recommendations: Array<{
    action: string
    expectedSaving: string
    difficulty: 'easy' | 'medium' | 'hard'
  }>
  urgency: 'immediate' | 'this_week' | 'this_month'
}

export interface ScenarioAnalysis {
  scenarioName: string
  summary: string
  projectedOutcome: {
    runwayChange: string
    burnRateChange: string
    revenueImpact: string
  }
  breakEvenTimeline: string
  risks: string[]
  recommendation: string
  confidenceLevel: 'high' | 'medium' | 'low'
}

export interface BenchmarkInsights {
  burnMultiple: {
    yours: number
    benchmark: number
    assessment: string
  }
  cac?: {
    yours: number
    benchmark: number
    recommendation: string
  }
  pricing?: {
    yours: number
    marketAvg: number
    recommendation: string
  }
  overallAssessment: string
  improvementAreas: Array<{
    area: string
    currentValue: string
    targetValue: string
    action: string
  }>
}

// ==========================================
// ORIGINAL FUNCTIONS (enhanced)
// ==========================================
export async function generateFinancialInsights(data: FinancialData) {
  const prompt = `You are a senior CFO advisor for startups. Analyze this financial data and provide actionable insights.

QUALITY GUARDRAILS:
- Always cite specific data points
- Avoid generic advice like "cut costs"
- Provide concrete actions with expected impact
- Include timeframes and thresholds

Current Financial Status:
- Cash Balance: $${data.cashBalance.toLocaleString()}
- Monthly Burn Rate: $${data.burnRate.toLocaleString()}
- Runway: ${data.runway.toFixed(1)} months
${data.mrr ? `- Monthly Recurring Revenue: $${data.mrr.toLocaleString()}` : ''}
${data.revenueGrowthMoM ? `- Revenue Growth: ${data.revenueGrowthMoM}% MoM` : ''}
${data.topExpenseCategory ? `- Top Expense: ${data.topExpenseCategory} ($${data.topExpenseAmount?.toLocaleString()})` : ''}

${data.recentTransactions
      ? `Recent Major Transactions:
${data.recentTransactions
        .slice(0, 5)
        .map((t) => `- ${t.description}: $${Math.abs(t.amount).toLocaleString()} (${t.category})`)
        .join('\n')}`
      : ''
    }

Provide insights in this JSON format:
{
  "summary": "One-sentence overall financial health assessment with specific numbers",
  "insights": [
    {
      "type": "warning" | "opportunity" | "recommendation",
      "title": "Short title",
      "description": "Detailed explanation with specific dollar amounts and percentages",
      "impact": "Expected outcome if action is taken",
      "timeframe": "When to act"
    }
  ],
  "healthScore": 1-100,
  "topPriority": "The single most important thing to focus on this week"
}

Respond only with valid JSON.`

  const response = await getOpenAIClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a startup CFO advisor. Always respond in valid JSON. Be specific with numbers, avoid generic advice.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 1500,
  })

  const content = response.choices[0]?.message?.content || '{}'

  try {
    return JSON.parse(content)
  } catch {
    return {
      summary: 'Financial analysis in progress',
      insights: [],
      healthScore: 50,
    }
  }
}

export async function answerFinancialQuestion(
  question: string,
  context: FinancialData
) {
  const prompt = `You are a financial assistant for a startup. Answer this question based on the data.

GUIDELINES:
- Be specific with numbers
- If recommending action, explain WHY
- Consider impact on runway
- Provide actionable next steps

Question: "${question}"

Financial Data:
- Cash Balance: $${context.cashBalance.toLocaleString()}
- Monthly Burn Rate: $${context.burnRate.toLocaleString()}
- Runway: ${context.runway.toFixed(1)} months
${context.mrr ? `- Monthly Recurring Revenue: $${context.mrr.toLocaleString()}` : ''}
${context.headcount ? `- Current Headcount: ${context.headcount}` : ''}

Example format for hiring questions:
"Yes, with caution. Adding 2 designers ($140K/year combined) would increase monthly burn by $11.7K, reducing runway from 18 to 16 months. However, if they help ship the new product (projected +$50K MRR), ROI would be positive within 4 months."

Provide a clear, data-driven answer in 3-4 sentences.`

  const response = await getOpenAIClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful startup financial assistant. Be concise, specific, and data-driven. Always cite numbers from the provided data.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.5,
    max_tokens: 400,
  })

  return (
    response.choices[0]?.message?.content || "I couldn't process that question. Please try again."
  )
}

// ==========================================
// WEEKLY CFO BRIEFING
// ==========================================
export async function generateCFOBriefing(data: FinancialData): Promise<CFOBriefing> {
  const prompt = `You are a CFO advisor. Generate a weekly executive briefing (200 words max).

Data:
- Current Runway: ${data.runway.toFixed(1)} months
- Burn Rate: $${data.burnRate.toLocaleString()}/mo
- Revenue Growth: ${data.revenueGrowthMoM || 0}% MoM
- Top Expense: ${data.topExpenseCategory || 'Payroll'} ($${(data.topExpenseAmount || data.burnRate * 0.6).toLocaleString()})
- Cash Balance: $${data.cashBalance.toLocaleString()}
${data.mrr ? `- MRR: $${data.mrr.toLocaleString()}` : ''}

Provide in JSON format:
{
  "executiveSummary": "2 sentences max summarizing financial health",
  "actionItems": [
    {
      "priority": "high" | "medium" | "low",
      "action": "Specific action to take",
      "expectedImpact": "Dollar or percentage impact",
      "timeframe": "This week, This month, This quarter"
    }
  ],
  "risksToMonitor": [
    {
      "risk": "Specific risk",
      "severity": "critical" | "warning" | "info",
      "mitigation": "How to address"
    }
  ],
  "metrics": {
    "runwayStatus": "${data.runway > 12 ? 'healthy' : data.runway > 6 ? 'warning' : 'critical'}",
    "burnEfficiency": "Description of burn efficiency",
    "growthTrajectory": "Description of growth"
  }
}

Top 3 action items only. Be specific with numbers.`

  const response = await getOpenAIClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a CFO advisor. Respond only with valid JSON.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.6,
    max_tokens: 800,
  })

  try {
    return JSON.parse(response.choices[0]?.message?.content || '{}')
  } catch {
    return {
      executiveSummary: 'Unable to generate briefing at this time.',
      actionItems: [],
      risksToMonitor: [],
      metrics: {
        runwayStatus: data.runway > 12 ? 'healthy' : data.runway > 6 ? 'warning' : 'critical',
        burnEfficiency: 'Analysis pending',
        growthTrajectory: 'Analysis pending',
      },
    }
  }
}

// ==========================================
// INTELLIGENT ALERT EXPLANATIONS
// ==========================================
export async function generateAlertExplanation(
  alertType: string,
  alertValue: number,
  previousValue: number,
  context: FinancialData
): Promise<AlertExplanation> {
  const changePercent = previousValue > 0
    ? ((alertValue - previousValue) / previousValue * 100).toFixed(1)
    : '0'

  const prompt = `Generate an intelligent explanation for this financial alert.

Alert: ${alertType}
Current Value: $${alertValue.toLocaleString()}
Previous Value: $${previousValue.toLocaleString()}
Change: ${changePercent}%

Company Context:
- Runway: ${context.runway.toFixed(1)} months
- Cash: $${context.cashBalance.toLocaleString()}
- Burn: $${context.burnRate.toLocaleString()}/mo

Instead of just "Burn rate increased ${changePercent}%", provide:
1. What likely caused this change
2. Impact on runway/cash
3. Specific recommendations with expected savings

Example output:
"Your burn rate jumped to $185K/mo (+15%) likely due to new hires and increased cloud costs. This reduces runway to 14 months. Consider: negotiating annual AWS contract (potential 20% discount = $2K/mo savings)."

JSON format:
{
  "headline": "One sentence with key numbers",
  "rootCause": "Likely explanation for the change",
  "impact": "How this affects runway/cash",
  "recommendations": [
    {
      "action": "Specific action",
      "expectedSaving": "Dollar amount or percentage",
      "difficulty": "easy" | "medium" | "hard"
    }
  ],
  "urgency": "immediate" | "this_week" | "this_month"
}`

  const response = await getOpenAIClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a financial analyst. Provide intelligent, specific explanations.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.6,
    max_tokens: 600,
  })

  try {
    return JSON.parse(response.choices[0]?.message?.content || '{}')
  } catch {
    return {
      headline: `${alertType} changed by ${changePercent}%`,
      rootCause: 'Analysis in progress',
      impact: 'Reviewing impact on financial metrics',
      recommendations: [],
      urgency: 'this_week',
    }
  }
}

// ==========================================
// SCENARIO ANALYSIS EXPLANATIONS
// ==========================================
export async function generateScenarioAnalysis(
  scenarioType: string,
  variables: Record<string, number>,
  context: FinancialData
): Promise<ScenarioAnalysis> {
  const prompt = `Analyze this financial scenario and provide actionable insights.

Scenario: ${scenarioType}
Variables Changed:
${Object.entries(variables).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

Current State:
- Runway: ${context.runway.toFixed(1)} months
- Burn: $${context.burnRate.toLocaleString()}/mo
- Cash: $${context.cashBalance.toLocaleString()}
${context.mrr ? `- MRR: $${context.mrr.toLocaleString()}` : ''}

Example analysis:
"Increasing marketing spend to $50K/mo could accelerate growth to 15% MoM (from 10%) based on typical CAC efficiency. However, this would shorten runway by 3 months unless revenue grows as projected. Break-even timeline: 8 months."

JSON format:
{
  "scenarioName": "Name of scenario",
  "summary": "2-3 sentence analysis",
  "projectedOutcome": {
    "runwayChange": "+/- X months",
    "burnRateChange": "+/- $X/mo",
    "revenueImpact": "Expected revenue change"
  },
  "breakEvenTimeline": "X months",
  "risks": ["Risk 1", "Risk 2"],
  "recommendation": "Should they do this? Why?",
  "confidenceLevel": "high" | "medium" | "low"
}`

  const response = await getOpenAIClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a startup financial modeler. Provide realistic scenario analysis.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.6,
    max_tokens: 700,
  })

  try {
    return JSON.parse(response.choices[0]?.message?.content || '{}')
  } catch {
    return {
      scenarioName: scenarioType,
      summary: 'Scenario analysis in progress',
      projectedOutcome: {
        runwayChange: 'Calculating...',
        burnRateChange: 'Calculating...',
        revenueImpact: 'Calculating...',
      },
      breakEvenTimeline: 'TBD',
      risks: [],
      recommendation: 'Analysis pending',
      confidenceLevel: 'low',
    }
  }
}

// ==========================================
// COMPETITIVE BENCHMARKING
// ==========================================
export async function generateBenchmarkInsights(
  context: FinancialData,
  industry: string = 'SaaS',
  stage: string = 'Series A'
): Promise<BenchmarkInsights> {
  // Calculate burn multiple
  const annualBurn = context.burnRate * 12
  const arr = (context.mrr || 0) * 12
  const burnMultiple = arr > 0 ? annualBurn / arr : 0

  const prompt = `Provide competitive benchmarking insights for this startup.

Company Metrics:
- Burn Rate: $${context.burnRate.toLocaleString()}/mo
- MRR: $${(context.mrr || 0).toLocaleString()}
- ARR: $${arr.toLocaleString()}
- Burn Multiple: ${burnMultiple.toFixed(1)}x (spending $${burnMultiple.toFixed(1)} to generate $1 ARR)
- Industry: ${industry}
- Stage: ${stage}

Benchmark data for ${stage} ${industry} companies:
- Median Burn Multiple: 4.5x
- Average CAC: $6,000
- Average ACV: $25,000

Example output:
"Your burn multiple (6.2x) is higher than similar Series A SaaS companies (avg 4.5x). This suggests you're spending $6.20 to generate $1 of ARR vs. $4.50 for peers. Focus on: reducing CAC or increasing prices."

JSON format:
{
  "burnMultiple": {
    "yours": ${burnMultiple.toFixed(1)},
    "benchmark": 4.5,
    "assessment": "How you compare and what it means"
  },
  "overallAssessment": "2-3 sentence summary of competitive position",
  "improvementAreas": [
    {
      "area": "Specific metric",
      "currentValue": "Your value",
      "targetValue": "Benchmark value",
      "action": "How to improve"
    }
  ]
}`

  const response = await getOpenAIClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a startup benchmarking analyst. Compare against real industry data.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.5,
    max_tokens: 800,
  })

  try {
    return JSON.parse(response.choices[0]?.message?.content || '{}')
  } catch {
    return {
      burnMultiple: {
        yours: burnMultiple,
        benchmark: 4.5,
        assessment: 'Comparison analysis pending',
      },
      overallAssessment: 'Benchmarking analysis in progress',
      improvementAreas: [],
    }
  }
}

// ==========================================
// HIRING AFFORDABILITY CHECK
// ==========================================
export async function analyzeHiringDecision(
  roleName: string,
  annualSalary: number,
  context: FinancialData
): Promise<string> {
  const monthlyCost = annualSalary / 12
  const newBurn = context.burnRate + monthlyCost
  const newRunway = context.cashBalance / newBurn

  const prompt = `Analyze if this startup can afford to make this hire.

Proposed Hire:
- Role: ${roleName}
- Annual Salary: $${annualSalary.toLocaleString()}
- Monthly Cost: $${monthlyCost.toLocaleString()}

Current State:
- Cash: $${context.cashBalance.toLocaleString()}
- Burn: $${context.burnRate.toLocaleString()}/mo
- Runway: ${context.runway.toFixed(1)} months

After Hire:
- New Burn: $${newBurn.toLocaleString()}/mo
- New Runway: ${newRunway.toFixed(1)} months
- Runway Reduction: ${(context.runway - newRunway).toFixed(1)} months

Consider:
1. Can they afford this with current runway?
2. What ROI would justify this hire?
3. Should they wait? Any alternatives?

Provide a 4-5 sentence analysis similar to:
"Yes, with caution. Adding this ${roleName} ($${annualSalary.toLocaleString()}/year) would reduce runway from ${context.runway.toFixed(1)} to ${newRunway.toFixed(1)} months. [Recommendation based on situation]"`

  const response = await getOpenAIClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a startup CFO. Give specific, actionable hiring advice.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.5,
    max_tokens: 400,
  })

  return response.choices[0]?.message?.content || 'Unable to analyze hiring decision at this time.'
}
