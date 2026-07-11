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

Based strictly on these numbers, please provide an investment recommendation.`,
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
