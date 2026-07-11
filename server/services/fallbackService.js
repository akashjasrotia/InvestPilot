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
  generateFallbackAnalysis
};
