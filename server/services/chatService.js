const { ChatOpenAI } = require('@langchain/openai');
const { HumanMessage, SystemMessage, AIMessage } = require('@langchain/core/messages');

async function chatWithAnalyst(context, history, userMessage) {
  const model = new ChatOpenAI({
    modelName: 'qwen-plus',
    temperature: 0.5,
    apiKey: process.env.QWEN_API_KEY,
    configuration: {
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    }
  });

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
---

Rules:
- Only answer questions about ${context.companyName} and this specific analysis.
- If the user asks about a completely different company or topic unrelated to this analysis, politely say: "I'm focused on ${context.companyName} right now. Feel free to ask me anything about this company's financials, risks, or recommendation."
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
