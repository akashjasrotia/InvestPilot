const { PromptTemplate } = require('@langchain/core/prompts');

const analystPrompt = new PromptTemplate({
  template: `You are an expert financial analyst. Analyze the following financial metrics for {companyName} ({ticker}) and provide an investment recommendation.

Financial Data:
- Revenue: {revenue}
- Net Income: {netIncome}
- Assets: {assets}
- Liabilities: {liabilities}
- Equity: {equity}

Calculated Metrics:
- Revenue Growth (YoY): {revenueGrowth}
- Profit Margin: {profitMargin}
- Debt-to-Equity: {debtToEquity}
- Return on Equity (ROE): {returnOnEquity}

Based strictly on these numbers, please provide an investment recommendation. 

CRITICAL INSTRUCTIONS:
1. Recommendation: Choose either "Invest" or "Pass".
2. Summary: Keep the summary extremely simple. It should be exactly one conversational sentence explaining the biggest factor. For example: "I won't recommend this because of the biggest factor being..." or "I recommend this because of the biggest factor being...". Do not use complex financial jargon. The summary MUST match your recommendation.
3. Bull Case (keyFactors): Provide exactly 2-3 positive factors about the financial metrics.
4. Risk Factors (risks): Provide exactly 2-3 negative factors or risks about the financial metrics.`,
  inputVariables: [
    "companyName", 
    "ticker", 
    "revenue",
    "netIncome",
    "assets",
    "liabilities",
    "equity",
    "revenueGrowth", 
    "profitMargin", 
    "debtToEquity", 
    "returnOnEquity"
  ],
});

module.exports = analystPrompt;
