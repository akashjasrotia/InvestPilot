const { tool } = require('@langchain/core/tools');
const { z } = require('zod');
const secService = require('../services/secService');

const secTool = tool(async ({ query }) => {
  const company = await secService.resolveTickerToCIK(query);
  if (!company) {
    throw new Error('Company not found in SEC database');
  }
  const facts = await secService.getCompanyFacts(company.cik);
  return { company, facts };
}, {
  name: "sec_data_fetcher",
  description: "Fetches company info and raw SEC financial facts based on a ticker or company name query.",
  schema: z.object({
    query: z.string().describe("The company ticker or name to search for.")
  })
});

module.exports = secTool;
