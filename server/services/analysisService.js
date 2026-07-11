const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { PromptTemplate } = require('@langchain/core/prompts');

/**
 * Extracts specific financial metrics from SEC facts and calculates ratios.
 */
function extractMetrics(facts) {
  // A helper function to safely get the most recent value from US GAAP facts
  const getLatestValue = (concept) => {
    try {
      const usGaap = facts.facts['us-gaap'];
      if (!usGaap || !usGaap[concept] || !usGaap[concept].units || !usGaap[concept].units.USD) {
        return null; // Concept not found
      }
      
      const values = usGaap[concept].units.USD;
      // Get the last item in the array, assuming it's the most recent 10-K/10-Q filing
      // We filter for 10-K (annual) or just get the last one for simplicity
      const annualValues = values.filter(v => v.form === '10-K');
      if (annualValues.length > 0) {
        // Return the most recent annual value
        return annualValues[annualValues.length - 1].val;
      }
      
      // Fallback to the very last value if no 10-K found
      return values[values.length - 1].val;
    } catch (e) {
      return null;
    }
  };

  // 1. Extract base metrics
  // Revenues or SalesRevenueNet
  const revenue = getLatestValue('Revenues') || getLatestValue('SalesRevenueNet') || 0;
  const netIncome = getLatestValue('NetIncomeLoss') || 0;
  const assets = getLatestValue('Assets') || 0;
  const liabilities = getLatestValue('Liabilities') || 0;
  const equity = getLatestValue('StockholdersEquity') || (assets - liabilities);

  // For revenue growth, let's try to get the previous year's revenue
  let revenueGrowth = 0;
  try {
    const revConcept = facts.facts['us-gaap']['Revenues'] ? 'Revenues' : 'SalesRevenueNet';
    const values = facts.facts['us-gaap'][revConcept].units.USD.filter(v => v.form === '10-K');
    if (values.length > 1) {
      const current = values[values.length - 1].val;
      const previous = values[values.length - 2].val;
      revenueGrowth = previous !== 0 ? ((current - previous) / previous) * 100 : 0;
    }
  } catch (e) {
    // Leave growth as 0 if we can't calculate it
  }

  // 2. Calculate derived ratios
  const profitMargin = revenue !== 0 ? (netIncome / revenue) * 100 : 0;
  const debtToEquity = equity !== 0 ? (liabilities / equity) : 0;
  const returnOnEquity = equity !== 0 ? (netIncome / equity) * 100 : 0;

  return {
    raw: {
      revenue,
      netIncome,
      assets,
      liabilities,
      equity
    },
    calculated: {
      revenueGrowth: revenueGrowth.toFixed(2) + '%',
      profitMargin: profitMargin.toFixed(2) + '%',
      debtToEquity: debtToEquity.toFixed(2),
      returnOnEquity: returnOnEquity.toFixed(2) + '%'
    }
  };
}

async function generateAnalysis(company, metrics) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is missing. Using rule-based fallback.");
    return generateFallbackAnalysis(company, metrics);
  }

  try {
    const model = new ChatGoogleGenerativeAI({
      modelName: "gemini-2.5-flash",
      temperature: 0.2, // Low temperature for more analytical/factual output
    });

    const promptTemplate = new PromptTemplate({
      template: `
        You are an expert financial analyst. Analyze the following financial metrics for {companyName} ({ticker}) 
        and provide an investment recommendation.

        Financial Data:
        - Revenue: ${metrics.raw.revenue}
        - Net Income: ${metrics.raw.netIncome}
        - Assets: ${metrics.raw.assets}
        - Liabilities: ${metrics.raw.liabilities}
        - Equity: ${metrics.raw.equity}
        
        Calculated Metrics:
        - Revenue Growth (YoY): {revenueGrowth}
        - Profit Margin: {profitMargin}
        - Debt-to-Equity: {debtToEquity}
        - Return on Equity (ROE): {returnOnEquity}

        Based strictly on these numbers, please provide a JSON response with exactly this structure, and nothing else (do not wrap in markdown blocks like \`\`\`json):
        {{
          "recommendation": "Invest" or "Pass",
          "confidence": <integer from 0 to 100>,
          "summary": "<A 2-3 sentence summary of the financial health>",
          "keyFactors": ["<factor 1>", "<factor 2>", "<factor 3>"],
          "risks": ["<risk 1>", "<risk 2>"]
        }}
      `,
      inputVariables: ["companyName", "ticker", "revenueGrowth", "profitMargin", "debtToEquity", "returnOnEquity"],
    });

    const prompt = await promptTemplate.format({
      companyName: company.name,
      ticker: company.ticker,
      revenueGrowth: metrics.calculated.revenueGrowth,
      profitMargin: metrics.calculated.profitMargin,
      debtToEquity: metrics.calculated.debtToEquity,
      returnOnEquity: metrics.calculated.returnOnEquity
    });

    const response = await model.invoke(prompt);
    let resultText = response.content;
    
    // Clean up response if Gemini includes markdown wrapping
    resultText = resultText.replace(/^```json/g, '').replace(/```$/g, '').trim();

    console.log("Fetched with Gemini");
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Error generating AI analysis, using fallback:", error);
    return generateFallbackAnalysis(company, metrics);
  }
}

/**
 * A simple rule-based fallback if AI generation fails or key is missing.
 */
function generateFallbackAnalysis(company, metrics) {
  const pm = parseFloat(metrics.calculated.profitMargin);
  const de = parseFloat(metrics.calculated.debtToEquity);
  
  let recommendation = "Pass";
  let confidence = 50;

  // Simple logic: Good profit margin and healthy debt = Invest
  if (pm > 10 && de < 2) {
    recommendation = "Invest";
    confidence = 80;
  } else if (pm > 0 && de < 4) {
    recommendation = "Invest";
    confidence = 60;
  }

  console.log("Fetched with fallback");
  return {
    recommendation,
    confidence,
    summary: `Based on automated rules, ${company.name} has a profit margin of ${pm}% and a debt-to-equity ratio of ${de}.`,
    keyFactors: [
      `Profit Margin: ${metrics.calculated.profitMargin}`,
      `Return on Equity: ${metrics.calculated.returnOnEquity}`
    ],
    risks: [
      `Debt-to-Equity is ${metrics.calculated.debtToEquity}`,
      "This is a fallback analysis, not AI generated."
    ]
  };
}

module.exports = {
  extractMetrics,
  generateAnalysis
};
