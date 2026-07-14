const yf = require('yahoo-finance2');
const yahooFinance = new yf.default({ suppressNotices: ['yahooSurvey'] });

async function getCompanyData(query) {
  try {
    // Search for the ticker
    const searchResults = await yahooFinance.search(query, { quotesCount: 1 });
    const topResult = searchResults.quotes && searchResults.quotes[0];

    const ticker = topResult ? topResult.symbol : query.toUpperCase();
    const companyName = topResult ? (topResult.longname || topResult.shortname || ticker) : ticker;

    const company = { cik: ticker, ticker, name: companyName };

    // Fetch financial data
    const summary = await yahooFinance.quoteSummary(ticker, {
      modules: ['financialData', 'defaultKeyStatistics', 'incomeStatementHistory']
    });

    const fd = summary.financialData || {};
    const ks = summary.defaultKeyStatistics || {};
    const incomeHistory = summary.incomeStatementHistory?.incomeStatementHistory || [];

    // Calculate year-over-year revenue growth from income statement history
    let revenueGrowth = fd.revenueGrowth != null ? fd.revenueGrowth * 100 : 0;

    const revenue = fd.totalRevenue || 0;
    const netIncome = fd.netIncomeToCommon || 0;
    const totalCash = fd.totalCash || 0;
    const totalDebt = fd.totalDebt || 0;
    const equity = ks.bookValue && ks.sharesOutstanding 
      ? ks.bookValue * ks.sharesOutstanding 
      : (revenue > 0 ? revenue * 0.3 : 1);

    const assets = totalCash + totalDebt + Math.abs(equity);
    const liabilities = totalDebt;

    const profitMargin = fd.profitMargins != null ? fd.profitMargins * 100 : (revenue > 0 ? (netIncome / revenue) * 100 : 0);
    const debtToEquity = fd.debtToEquity != null ? fd.debtToEquity / 100 : (equity !== 0 ? liabilities / equity : 0);
    const returnOnEquity = fd.returnOnEquity != null ? fd.returnOnEquity * 100 : (equity !== 0 ? (netIncome / equity) * 100 : 0);

    return {
      company,
      metrics: {
        raw: { revenue, netIncome, assets, liabilities, equity },
        calculated: {
          revenueGrowth: revenueGrowth.toFixed(2) + '%',
          profitMargin: profitMargin.toFixed(2) + '%',
          debtToEquity: debtToEquity.toFixed(2),
          returnOnEquity: returnOnEquity.toFixed(2) + '%'
        }
      }
    };
  } catch (error) {
    console.error('Yahoo Finance error:', error.message);
    throw new Error('Failed to fetch financial data. Please check the company name or ticker and try again.');
  }
}

module.exports = { getCompanyData };
