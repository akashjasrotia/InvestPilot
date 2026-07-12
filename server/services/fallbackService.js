function generateFallbackAnalysis(company, metrics) {
  const pm = parseFloat(metrics.calculated.profitMargin);
  const de = parseFloat(metrics.calculated.debtToEquity);
  
  let recommendation = "Pass";
  let confidence = 50;

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
    summary: recommendation === 'Invest' 
      ? `I recommend this because of the biggest factor being the healthy profit margin of ${pm}%.`
      : `I won't recommend this because of the biggest factor being the poor debt-to-equity ratio and weak margins.`,
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
  generateFallbackAnalysis
};
