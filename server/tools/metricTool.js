const { tool } = require('@langchain/core/tools');
const { z } = require('zod');
const metricService = require('../services/metricService');

const metricTool = tool(async ({ facts }) => {
  return metricService.extractMetrics(facts);
}, {
  name: "metric_extractor",
  description: "Extracts key financial metrics (revenue, profit margin, ROE, etc.) from raw SEC facts.",
  schema: z.object({
    facts: z.any().describe("Raw SEC XBRL company facts.")
  })
});

module.exports = metricTool;
