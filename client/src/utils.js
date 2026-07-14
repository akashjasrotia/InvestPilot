export const getMockNews = (companyName, ticker, recommendation) => {
  const isInvest = recommendation === 'Invest';
  const yahooNewsUrl = `https://finance.yahoo.com/quote/${ticker}/news`;
  
  return [
    {
      id: 1,
      headline: isInvest ? `${companyName} Shows Strong Quarterly Momentum` : `${companyName} Faces Market Headwinds Amid Macro Pressures`,
      date: "2 days ago",
      summary: isInvest ? `Analysts highlight robust financial health for ${ticker} following a surprisingly resilient operating period.` : `Recent reports suggest ${ticker} is struggling to maintain its operating margins in the current environment.`,
      sentiment: isInvest ? "Bullish" : "Bearish",
      link: yahooNewsUrl
    },
    {
      id: 2,
      headline: `${companyName} Announces Key Strategic Initiatives`,
      date: "1 week ago",
      summary: `The executive team at ${companyName} has outlined a new roadmap to streamline core operations going into the next fiscal year.`,
      sentiment: "Neutral",
      link: yahooNewsUrl
    },
    {
      id: 3,
      headline: isInvest ? `Why ${ticker} Is Becoming A Top Pick For Institutional Investors` : `Investors Reduce Exposure to ${ticker} Following Industry Shifts`,
      date: "2 weeks ago",
      summary: isInvest ? `Large funds are increasing their holdings in ${companyName}, citing strong fundamentals and growth potential.` : `Regulatory adjustments and shifting market dynamics have caused some institutions to re-evaluate their positions in ${companyName}.`,
      sentiment: isInvest ? "Bullish" : "Bearish",
      link: yahooNewsUrl
    }
  ];
};
