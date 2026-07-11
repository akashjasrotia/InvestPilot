const { RunnableSequence } = require('@langchain/core/runnables');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { z } = require('zod');

const secTool = require('../tools/secTool');
const metricTool = require('../tools/metricTool');
const analystPrompt = require('../prompts/analystPrompt');
const { generateFallbackAnalysis } = require('../services/fallbackService');

// 1. Define Zod schema for structured output
const analysisSchema = z.object({
  recommendation: z.enum(["Invest", "Pass"]),
  confidence: z.number().int().min(0).max(100),
  summary: z.string().describe("A 2-3 sentence summary of the financial health"),
  keyFactors: z.array(z.string()).describe("List of positive factors or bull cases"),
  risks: z.array(z.string()).describe("List of risks or negative factors")
});

async function runInvestmentChain(query) {
  // Offline fallback bypasses the chain
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is missing. Using rule-based fallback.");
    const secResult = await secTool.invoke({ query });
    const metrics = await metricTool.invoke({ facts: secResult.facts });
    const analysis = generateFallbackAnalysis(secResult.company, metrics);
    return { company: secResult.company, metrics, analysis };
  }

  // 2. Initialize the model with structured output enforcement
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-3.5-flash", // Reverted to 3.5-flash since 1.5-pro is blocked
    temperature: 0.2,
    apiKey: process.env.GEMINI_API_KEY,
  });
  
  const structuredModel = model.withStructuredOutput(analysisSchema);

  // 3. Construct the LangChain LCEL chain
  const chain = RunnableSequence.from([
    // Step A: Invoke SEC Tool
    async (input) => {
      const secData = await secTool.invoke({ query: input.query });
      return secData;
    },
    // Step B: Invoke Metric Tool
    async (secData) => {
      const metrics = await metricTool.invoke({ facts: secData.facts });
      return { company: secData.company, metrics };
    },
    // Step C: Format Prompt and invoke Model
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
      
      // LCEL composition for prompt -> model
      const llmChain = analystPrompt.pipe(structuredModel);
      const analysis = await llmChain.invoke(promptParams);
      
      console.log("Fetched with Gemini using LCEL Chain");
      return { company, metrics, analysis };
    }
  ]);

  // Execute the chain
  return chain.invoke({ query });
}

module.exports = {
  runInvestmentChain
};
