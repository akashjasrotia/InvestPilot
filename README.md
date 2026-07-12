# InvestPilot

A web app that lets you look up any public company and get an AI-generated investment analysis based on real SEC filing data.

Live: [invest-pilot-psi.vercel.app](https://invest-pilot-psi.vercel.app)

---

## What it does

You type in a company name or ticker (like `Apple` or `AAPL`), and the app:

1. Finds the company in the SEC EDGAR database
2. Pulls their latest 10-K financial data
3. Calculates key metrics (profit margin, debt-to-equity, ROE, etc.)
4. Sends everything to Gemini AI for an investment recommendation
5. Shows you a clean breakdown — Invest or Pass, confidence score, key risks, and bull case

Your search history is saved to your account so you can come back to past analyses.

---

## Tech stack

**Frontend** — React + Vite + Tailwind CSS, deployed on Vercel

**Backend** — Node.js + Express, deployed on Render

**AI** — LangChain + Gemini (via `@langchain/google-genai`)

**Database** — MySQL on Aiven (cloud-hosted)

**Data source** — SEC EDGAR Company Facts API (free, no API key needed)

---

## Running locally

### Prerequisites
- Node.js 18+
- A MySQL database (or Aiven free tier)
- A Gemini API key

### 1. Clone the repo
```bash
git clone https://github.com/your-username/InvestPilot.git
cd InvestPilot
```

### 2. Set up the server
```bash
cd server
npm install
```

Create a `.env` file in the `server` folder:
```
DATABASE_URL=your_mysql_connection_string
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=any_random_string
```

Start the server:
```bash
npm run dev
```

### 3. Set up the client
```bash
cd ../client
npm install
```

Create a `.env` file in the `client` folder:
```
VITE_API_URL=http://localhost:3000
```

Start the client:
```bash
npm run dev
```

Open `http://localhost:5173`.

---

## How the AI chain works

The backend uses LangChain's LCEL (LangChain Expression Language) to wire up the analysis pipeline:

```
User query
  → SEC EDGAR API (find company + fetch financials)
  → Metric extraction (profit margin, D/E ratio, ROE, etc.)
  → PromptTemplate (format data for the LLM)
  → Gemini with structured output (Zod schema)
  → JSON response saved to MySQL
  → Returned to frontend
```

The `withStructuredOutput()` method enforces a strict schema so the response is always predictable — no regex parsing or prompt hacks needed.

---

## Project structure

```
InvestPilot/
├── client/          # React frontend
│   └── src/
│       ├── App.jsx
│       ├── Auth.jsx
│       ├── Home.jsx
│       └── History.jsx
└── server/          # Express backend
    ├── server.js
    ├── config/
    │   └── db.js
    ├── ai/
    │   └── investmentChain.js
    ├── prompts/
    │   └── analystPrompt.js
    ├── services/
    │   ├── authService.js
    │   ├── databaseService.js
    │   ├── secService.js
    │   └── metricService.js
    ├── middleware/
    │   └── auth.js
    └── tools/
```

---

## Notes

- Data comes from the SEC EDGAR API which only covers US public companies.
- The AI recommendation is for educational purposes only, not financial advice.
- Free tier on Render may have cold start delays of 30-60 seconds after inactivity.
