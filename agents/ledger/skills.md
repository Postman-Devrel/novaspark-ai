# Ledger — Skills & Usage

## Claude Code Slash Command

```
/ledger <your request>
```

Invoke Ledger directly inside any Claude Code session. Paste CSV data inline or describe transactions.

### Examples

```
/ledger Categorize these expenses:
2026-04-01, Anthropic, $120, API usage
2026-04-01, Vercel, $20, hosting
2026-04-02, Vercel, $20, hosting
2026-04-03, Notion, $16, docs
2026-04-05, Fiverr, $250, contractor - logo design

/ledger What category does "Replit Cycles - $49" go under?

/ledger Generate a monthly finance summary for April 2026 — total spend by category, flag anomalies

/ledger Is spending $800/mo on AI APIs reasonable for a solo founder? What's the benchmark?

/ledger I have a $500 Stripe payout and a $49 Vercel charge on the same day — is that normal?
```

## MCP Tool

```json
{
  "tool": "ask_ledger",
  "arguments": {
    "message": "Categorize: Anthropic $120, Figma $15, AWS $67, Upwork $400 contractor payment"
  }
}
```

## Test Locally (HTTP)

```bash
cd agents/ledger && bun install

ANTHROPIC_API_KEY=sk-ant-... bun agent/index.ts
# 📊 Ledger is live on port 3000

# Basic message
curl -s -X POST http://localhost:3000 \
  -H "Content-Type: application/json" \
  -d '{"message": "Categorize: Anthropic $150, GitHub $4, Notion $8, AWS $32"}' \
  | jq .response

# With CSV attachment
curl -s -X POST http://localhost:3000 \
  -H "Content-Type: application/json" \
  -d '{"message": "Categorize and flag anomalies", "csv": "date,vendor,amount\n2026-04-01,Anthropic,150\n2026-04-01,Vercel,20\n2026-04-02,Vercel,20"}' \
  | jq .response
```

## Deploy to Astro AI

```bash
cd agents/ledger
ast push
```

Required secrets: `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY` (for Sheets write-back).
