const SEC_HEADERS = {
  'User-Agent': 'InvestPilot/1.0 (akash@investpilot.com)',
  'Accept-Encoding': 'gzip, deflate'
};

async function resolveTickerToCIK(query) {
  try {
    const response = await fetch('https://www.sec.gov/files/company_tickers.json', {
      headers: SEC_HEADERS
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch company tickers from SEC. Status: ${response.status}`);
    }

    const data = await response.json();
    const queryUpper = query.toUpperCase();

    for (const key in data) {
      const company = data[key];
      if (company.ticker === queryUpper || company.title.toUpperCase().includes(queryUpper)) {
        const paddedCIK = String(company.cik_str).padStart(10, '0');
        return {
          cik: paddedCIK,
          ticker: company.ticker,
          name: company.title
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error in resolveTickerToCIK:', error);
    throw new Error('Failed to resolve company ticker. The SEC database might be rate-limiting requests. Please try again in a few seconds.');
  }
}

async function getCompanyFacts(cik) {
  try {
    const url = `https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`;
    const response = await fetch(url, {
      headers: SEC_HEADERS
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch SEC facts. Status: ${response.status}`);
    }

    const facts = await response.json();
    return facts;
  } catch (error) {
    console.error(`Error fetching SEC facts for CIK ${cik}:`, error);
    throw new Error('Failed to fetch financial data from SEC. The SEC database might be temporarily rate-limiting requests. Please try again.');
  }
}

module.exports = {
  resolveTickerToCIK,
  getCompanyFacts
};
