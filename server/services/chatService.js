const { ChatOpenAI } = require('@langchain/openai');
const { HumanMessage, SystemMessage, AIMessage } = require('@langchain/core/messages');

async function chatWithAnalyst(context, history, userMessage) {
  const model = new ChatOpenAI({
    modelName: 'openai/gpt-4o-mini',
    temperature: 0.5,
    apiKey: process.env.OPENROUTER_API_KEY,
    timeout: 15000,
    configuration: {
      baseURL: 'https://openrouter.ai/api/v1',
    }
  });

  const newsContext = context.news && context.news.length > 0
    ? `Recent News & Sentiment:
${context.news.map((n, i) => `${i + 1}. [Sentiment: ${n.sentiment}] "${n.headline}" (${n.date}) - ${n.summary}`).join('\n')}`
    : 'No recent news was evaluated.';

  const systemPrompt = `You are a financial analyst assistant for InvestPilot. You have been given the following investment research data for ${context.companyName} (${context.ticker}). Your job is to help the user understand this specific company's analysis.

--- Company Analysis Context ---
Company: ${context.companyName} (${context.ticker})
Recommendation: ${context.recommendation} (${context.confidence}% confidence)
Summary: ${context.summary}

Key Metrics:
- Revenue Growth: ${context.metrics.revenueGrowth}
- Profit Margin: ${context.metrics.profitMargin}
- Debt-to-Equity: ${context.metrics.debtToEquity}
- Return on Equity: ${context.metrics.returnOnEquity}

Bull Case:
${context.keyFactors.map((f, i) => `${i + 1}. ${f}`).join('\n')}

Risk Factors:
${context.risks.map((r, i) => `${i + 1}. ${r}`).join('\n')}

${newsContext}
---

- Focus on answering questions about ${context.companyName}, this specific analysis, and the provided news articles.
- If the user asks about a completely different company, politely say: "I'm focused on ${context.companyName} right now. Feel free to ask me anything about this company's financials, risks, or recommendation."
- If the user asks about live/real-time stock prices or real-time news not present in the context above, politely explain that you do not have live internet search or general real-time feeds in this session, but you can discuss the specific analysis, metrics, risks, and news articles listed in the context.
- Keep answers conversational, clear, and jargon-free. Max 3-4 sentences unless a detailed explanation is needed.
- Do not make up data. Only use what is provided in the context above.`;

  const messages = [
    new SystemMessage(systemPrompt),
    ...history.map((msg) =>
      msg.role === 'user'
        ? new HumanMessage(msg.content)
        : new AIMessage(msg.content)
    ),
    new HumanMessage(userMessage),
  ];

  const response = await model.invoke(messages);
  return response.content;
}

module.exports = { chatWithAnalyst };
