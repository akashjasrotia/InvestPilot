const { RunnableSequence } = require('@langchain/core/runnables');
const { ChatOpenAI } = require('@langchain/openai');
const { z } = require('zod');

const secTool = require('../tools/secTool');
const metricTool = require('../tools/metricTool');
const analystPrompt = require('../prompts/analystPrompt');
const { generateFallbackAnalysis } = require('../services/fallbackService');

const analysisSchema = z.object({
  recommendation: z.enum(["Invest", "Pass"]),
  confidence: z.number().int().min(0).max(100),
  summary: z.string().describe("A single, conversational sentence explaining the biggest factor for the recommendation. Start with 'I recommend this because of the biggest factor being...' or 'I won't recommend this because of the biggest factor being...'. Do not use complex jargon."),
  keyFactors: z.array(z.string()).describe("List of positive factors or bull cases"),
  risks: z.array(z.string()).describe("List of risks or negative factors")
});

async function runInvestmentChain(query) {
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn("OPENROUTER_API_KEY is missing. Using rule-based fallback.");
    const secResult = await secTool.invoke({ query });
    const metrics = await metricTool.invoke({ facts: secResult.facts });
    const analysis = generateFallbackAnalysis(secResult.company, metrics);
    return { company: secResult.company, metrics, analysis };
  }

  const model = new ChatOpenAI({
    modelName: "openai/gpt-4o-mini", 
    temperature: 0.2,
    apiKey: process.env.OPENROUTER_API_KEY,
    configuration: {
      baseURL: 'https://openrouter.ai/api/v1',
    }
  });
  
  const structuredModel = model.withStructuredOutput(analysisSchema);

  const chain = RunnableSequence.from([
    async (input) => {
      const secData = await secTool.invoke({ query: input.query });
      return secData;
    },
    async (secData) => {
      const metrics = await metricTool.invoke({ facts: secData.facts });
      return { company: secData.company, metrics };
    },
    async ({ company, metrics }) => {
      const promptParams = {
        companyName: company.name,
        ticker: company.ticker,
        revenue: metrics.raw.revenue,
        netIncome: metrics.raw.netIncome,
        assets: metrics.raw.assets,
        liabilities: metrics.raw.liabilities,
        equity: metrics.raw.equity,
        revenueGrowth: metrics.calculated.revenueGrowth,
        profitMargin: metrics.calculated.profitMargin,
        debtToEquity: metrics.calculated.debtToEquity,
        returnOnEquity: metrics.calculated.returnOnEquity
      };
      
      const llmChain = analystPrompt.pipe(structuredModel);
      const analysis = await llmChain.invoke(promptParams);
      
      console.log("Fetched with Gemini using LCEL Chain");
      return { company, metrics, analysis };
    }
  ]);

  return chain.invoke({ query });
}

module.exports = {
  runInvestmentChain
};
