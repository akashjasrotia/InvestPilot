function extractMetrics(facts) {
  const getLatestValue = (concept) => {
    try {
      const usGaap = facts.facts['us-gaap'];
      if (!usGaap || !usGaap[concept] || !usGaap[concept].units || !usGaap[concept].units.USD) {
        return null;
      }
      
      const values = usGaap[concept].units.USD;
      const annualValues = values.filter(v => v.form === '10-K');
      if (annualValues.length > 0) {
        return annualValues[annualValues.length - 1].val;
      }
      
      return values[values.length - 1].val;
    } catch (e) {
      return null;
    }
  };

  const revenue = getLatestValue('Revenues') || getLatestValue('SalesRevenueNet') || 0;
  const netIncome = getLatestValue('NetIncomeLoss') || 0;
  const assets = getLatestValue('Assets') || 0;
  const liabilities = getLatestValue('Liabilities') || 0;
  const equity = getLatestValue('StockholdersEquity') || (assets - liabilities);

  let revenueGrowth = 0;
  try {
    const revConcept = facts.facts['us-gaap']['Revenues'] ? 'Revenues' : 'SalesRevenueNet';
    const values = facts.facts['us-gaap'][revConcept].units.USD.filter(v => v.form === '10-K');
    if (values.length > 1) {
      const current = values[values.length - 1].val;
      const previous = values[values.length - 2].val;
      revenueGrowth = previous !== 0 ? ((current - previous) / previous) * 100 : 0;
    }
  } catch (e) {}

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

module.exports = {
  extractMetrics
};
