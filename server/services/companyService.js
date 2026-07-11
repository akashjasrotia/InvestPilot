// We use the built-in fetch API (available in Node 18+)

// The SEC requires a User-Agent header declaring who you are
const SEC_HEADERS = {
  'User-Agent': 'InvestPilotApp contact@investpilot.com'
};

/**
 * Fetches the list of all companies from SEC and finds the CIK for a given query.
 * The query can be a ticker (e.g. "AAPL") or part of a company name (e.g. "Apple").
 */
async function resolveTickerToCIK(query) {
  try {
    const response = await fetch('https://www.sec.gov/files/company_tickers.json', {
      headers: SEC_HEADERS
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch company tickers from SEC');
    }

    const data = await response.json();
    const queryUpper = query.toUpperCase();

    // Iterate through the object (it's formatted as { "0": { cik_str, ticker, title }, ... })
    for (const key in data) {
      const company = data[key];
      // Check for exact ticker match or partial name match
      if (company.ticker === queryUpper || company.title.toUpperCase().includes(queryUpper)) {
        // SEC APIs require the CIK to be padded to 10 digits
        const paddedCIK = String(company.cik_str).padStart(10, '0');
        return {
          cik: paddedCIK,
          ticker: company.ticker,
          name: company.title
        };
      }
    }
    
    return null; // No match found
  } catch (error) {
    console.error('Error in resolveTickerToCIK:', error);
    throw new Error('Failed to resolve company ticker');
  }
}

/**
 * Fetches all XBRL company facts for a given CIK from the SEC.
 */
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
    throw new Error('Failed to fetch financial data from SEC');
  }
}

module.exports = {
  resolveTickerToCIK,
  getCompanyFacts
};
