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

// Helper function to generate financial insights
export async function generateFinancialInsights(data: {
    cashBalance: number
    burnRate: number
    runway: number
    mrr?: number
    recentTransactions?: Array<{ description: string; amount: number; category: string }>
}) {
    const prompt = `You are a financial advisor for startups. Analyze this financial data and provide 3-5 actionable insights:

Current Financial Status:
- Cash Balance: $${data.cashBalance.toLocaleString()}
- Monthly Burn Rate: $${data.burnRate.toLocaleString()}
- Runway: ${data.runway.toFixed(1)} months
${data.mrr ? `- Monthly Recurring Revenue: $${data.mrr.toLocaleString()}` : ''}

${data.recentTransactions ? `Recent Major Transactions:
${data.recentTransactions.slice(0, 5).map(t => `- ${t.description}: $${Math.abs(t.amount).toLocaleString()} (${t.category})`).join('\n')}` : ''}

Provide insights in this JSON format:
{
  "summary": "One-sentence overall financial health assessment",
  "insights": [
    {
      "type": "warning" | "opportunity" | "recommendation",
      "title": "Short title",
      "description": "Detailed explanation and action item"
    }
  ],
  "healthScore": 1-100
}

Respond only with valid JSON.`

    const response = await getOpenAIClient().chat.completions.create({
        model: 'gpt-4o-mini', // Cost-effective model for insights
        messages: [
            { role: 'system', content: 'You are a startup financial advisor. Always respond in valid JSON format.' },
            { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
    })

    const content = response.choices[0]?.message?.content || '{}'

    try {
        return JSON.parse(content)
    } catch {
        return {
            summary: "Financial analysis in progress",
            insights: [],
            healthScore: 50
        }
    }
}

// Helper function for natural language queries
export async function answerFinancialQuestion(
    question: string,
    context: {
        cashBalance: number
        burnRate: number
        runway: number
        mrr?: number
    }
) {
    const prompt = `You are a financial assistant for a startup. Answer this question based on the data:

Question: "${question}"

Financial Data:
- Cash Balance: $${context.cashBalance.toLocaleString()}
- Monthly Burn Rate: $${context.burnRate.toLocaleString()}
- Runway: ${context.runway.toFixed(1)} months
${context.mrr ? `- Monthly Recurring Revenue: $${context.mrr.toLocaleString()}` : ''}

Provide a clear, concise answer in 2-3 sentences. Be specific with numbers when relevant.`

    const response = await getOpenAIClient().chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: 'You are a helpful startup financial assistant. Be concise and data-driven.' },
            { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 300,
    })

    return response.choices[0]?.message?.content || "I couldn't process that question. Please try again."
}
